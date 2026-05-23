import { NextResponse } from 'next/server';
import { getRsvpsByWedding, addRsvp, getRsvpCounts } from '@/lib/store';

export async function GET(req: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const list = getRsvpsByWedding(weddingId);
  const counts = getRsvpCounts(weddingId);
  return NextResponse.json({ counts, rsvps: list });
}

export async function POST(req: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  try {
    const { weddingId } = await params;
    const body = await req.json();
    if (!body?.guestId) return NextResponse.json({ ok: false, error: 'guestId required' }, { status: 400 });
    const created = addRsvp({ weddingId, ...body });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 400 });
  }
}
