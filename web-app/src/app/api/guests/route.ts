import { NextResponse } from 'next/server';
import { requireWeddingAccess } from '@/lib/rbac';
import { getEntitlements, normalizePlan } from '@/lib/plans';
import { listGuests, createGuest, guestSumMembers } from '@/lib/wedding-data';
import { dbSelect } from '@/lib/supabase-db';
import { getAdminCouples } from '@/lib/adminCouples';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const weddingId = url.searchParams.get('weddingId') || undefined;
  if (!weddingId) return NextResponse.json({ ok: false, error: 'weddingId required' }, { status: 400 });
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;

  const search = (url.searchParams.get('search') || '').toLowerCase();
  const side = url.searchParams.get('side') || undefined;

  let results = await listGuests(weddingId);
  if (side) results = results.filter(r => (r.side || '').toLowerCase() === side.toLowerCase());
  if (search) results = results.filter(r => (r.name || '').toLowerCase().includes(search) || (r.whatsapp || '').includes(search));

  const total = results.length;
  const limit = parseInt(url.searchParams.get('limit') || '0', 10);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  if (limit > 0) {
    return NextResponse.json({ guests: results.slice(offset, offset + limit), total, limit, offset });
  }
  return NextResponse.json(results);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.weddingId) return NextResponse.json({ ok: false, error: 'weddingId required' }, { status: 400 });
    const access = await requireWeddingAccess(String(body.weddingId));
    if (access.response) return access.response;
    if (!body?.name) return NextResponse.json({ ok: false, error: 'name required' }, { status: 400 });

    // Enforce plan guest limits
    const weddingRows = await dbSelect<{ userId?: string }>('Wedding', { id: `eq.${body.weddingId}` }, 'id,userId', 1);
    if (weddingRows[0]) {
      // Look up plan and per-couple override from admin-couples.json
      const adminCouple = getAdminCouples().find(c => c.id === weddingRows[0].userId);
      const plan = normalizePlan(adminCouple?.plan);
      const entitlements = getEntitlements(plan);
      // Per-couple override wins over plan default if set
      const maxGuests = (adminCouple?.guestLimit != null && adminCouple.guestLimit >= 0)
        ? adminCouple.guestLimit
        : entitlements.maxGuests;
      const existing = guestSumMembers(await listGuests(String(body.weddingId)));
      const incoming = Number.isFinite(Number(body?.maxMembers)) && Number(body?.maxMembers) > 0
        ? Number(body.maxMembers)
        : (body?.type === 'Family' ? 4 : 1);
      if (existing + incoming > maxGuests) {
        return NextResponse.json({
          ok: false,
          error: `Guest limit reached. Your ${plan} plan allows up to ${maxGuests} guests (currently ${existing}).`,
          plan,
          limit: maxGuests,
          current: existing,
        }, { status: 403 });
      }
    }

    const created = await createGuest(String(body.weddingId), body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 400 });
  }
}
