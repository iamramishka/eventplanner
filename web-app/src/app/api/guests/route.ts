import { NextResponse } from 'next/server';
import { requireWeddingAccess } from '@/lib/rbac';
import { getEntitlements, normalizePlan } from '@/lib/plans';
import { listGuests, createGuest, guestSumMembers } from '@/lib/wedding-data';
import { dbSelect } from '@/lib/supabase-db';

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
    const weddingRows = await dbSelect<{ plan?: string }>('Wedding', { id: `eq.${body.weddingId}` }, '*', 1);
    if (weddingRows[0]) {
      const plan = normalizePlan(weddingRows[0].plan);
      const entitlements = getEntitlements(plan);
      const existing = guestSumMembers(await listGuests(String(body.weddingId)));
      const incoming = body?.type === 'Family' ? 4 : (typeof body?.maxMembers === 'number' ? body.maxMembers : 1);
      if (existing + incoming > entitlements.maxGuests) {
        return NextResponse.json({
          ok: false,
          error: `Guest limit exceeded for ${plan} plan`,
          plan,
          limit: entitlements.maxGuests,
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
