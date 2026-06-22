import { NextResponse } from 'next/server';
import { listRsvpsByWedding, getRsvpCounts, addRsvpForGuestId } from '@/lib/wedding-data';
import { requireWeddingAccess } from '@/lib/rbac';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function GET(req: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  const [list, counts] = await Promise.all([
    listRsvpsByWedding(weddingId),
    getRsvpCounts(weddingId),
  ]);
  return NextResponse.json({ counts, rsvps: list });
}

export async function POST(req: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  try {
    const { weddingId } = await params;
    const access = await requireWeddingAccess(weddingId);
    if (access.response) return access.response;
    const body = await req.json();
    if (!body?.guestId) return NextResponse.json({ ok: false, error: 'guestId required' }, { status: 400 });
    const created = await addRsvpForGuestId(String(body.guestId), body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 400 });
  }
}
