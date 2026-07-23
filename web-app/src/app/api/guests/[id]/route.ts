import { NextResponse } from 'next/server';
import { requireGuestAccess } from '@/lib/rbac';
import { updateGuestById, deleteGuestById } from '@/lib/wedding-data';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = await requireGuestAccess(id);
    if (access.response) return access.response;
    const body = await req.json() as Record<string, unknown>;
    const updated = await updateGuestById(id, body);
    if (!updated) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
    return NextResponse.json(updated, { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireGuestAccess(id);
  if (access.response) return access.response;
  const removed = await deleteGuestById(id);
  if (!removed) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
