import { NextResponse } from 'next/server';
import { listRsvpsByWedding, addRsvpForGuestId } from '@/lib/wedding-data';
import { auditLog } from '@/lib/audit';
import { requireWeddingAccess } from '@/lib/rbac';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const weddingId = url.searchParams.get('weddingId') || undefined;
  if (!weddingId) return NextResponse.json({ ok: false, error: 'weddingId required' }, { status: 400 });
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  const rows = await listRsvpsByWedding(weddingId);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.weddingId) return NextResponse.json({ ok: false, error: 'weddingId required' }, { status: 400 });
    const access = await requireWeddingAccess(String(body.weddingId));
    if (access.response) return access.response;
    if (!body?.guestId) return NextResponse.json({ ok: false, error: 'guestId required' }, { status: 400 });
    const created = await addRsvpForGuestId(String(body.guestId), {
      ...body,
      attending: body.status === 'confirmed' || body.attending === true,
      memberCount: body.attendingCount ?? body.memberCount,
    });
    await auditLog({ action: 'create-rsvp', targetId: created.id, data: body });
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 400 });
  }
}
