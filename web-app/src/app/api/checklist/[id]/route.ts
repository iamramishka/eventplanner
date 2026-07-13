import { NextResponse } from 'next/server';
import { deleteChecklistItemById, toggleChecklistItemById, updateChecklistItemById } from '@/lib/wedding-data';
import { requireChecklistItemAccess } from '@/lib/rbac';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = await requireChecklistItemAccess(id);
    if (access.response) return access.response;
    const body = await req.json();
    const updated = body?.action === 'toggle'
      ? await toggleChecklistItemById(id, body.isCompleted)
      : await updateChecklistItemById(id, body);

    if (!updated) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireChecklistItemAccess(id);
  if (access.response) return access.response;
  const removed = await deleteChecklistItemById(id);
  if (!removed) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
