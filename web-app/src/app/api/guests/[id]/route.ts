import { NextResponse } from 'next/server';
import { updateGuest, deleteGuest, db } from '@/lib/store';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = db.guests.findMany(g => g.id === id)[0];
    if (!existing) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
    const updated = updateGuest(id, body as Parameters<typeof updateGuest>[1]);
    return NextResponse.json(updated || { ok: false }, { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = deleteGuest(id);
  if (!removed) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
