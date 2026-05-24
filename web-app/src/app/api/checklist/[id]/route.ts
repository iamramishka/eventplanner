import { NextResponse } from 'next/server';
import { deleteChecklistItem, toggleChecklistItem, updateChecklistItem } from '@/lib/store';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = body?.action === 'toggle'
      ? toggleChecklistItem(id, body.isCompleted)
      : updateChecklistItem(id, body);

    if (!updated) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = deleteChecklistItem(id);
  if (!removed) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, removed });
}
