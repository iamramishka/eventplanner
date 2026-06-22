import { NextResponse } from 'next/server';
import { updateTableById, deleteTableById } from '@/lib/wedding-data';
import { requireWeddingAccess } from '@/lib/rbac';

export async function PUT(req: Request, { params }: { params: Promise<{ weddingId: string; tableId: string }> }) {
  const { weddingId, tableId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  try {
    const body = await req.json();
    const updated = await updateTableById(tableId, body);
    if (!updated) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
    return NextResponse.json({ ok: true, data: updated });
  } catch (err: unknown) {
    return NextResponse.json({ ok: false, error: String(err instanceof Error ? err.message : err) }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ weddingId: string; tableId: string }> }) {
  const { weddingId, tableId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  const deleted = await deleteTableById(tableId);
  if (!deleted) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, data: deleted });
}
