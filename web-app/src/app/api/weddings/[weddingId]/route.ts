import { NextResponse } from 'next/server';
import { db, updateWedding } from '@/lib/store';
import { requireWeddingAccess } from '@/lib/rbac';

type StoreRow = {
  id?: unknown;
};

export async function GET(_: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  const wedding = db.weddings.findUnique((w: StoreRow) => w.id === weddingId);
  if (!wedding) {
    return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
  }
  return NextResponse.json(wedding);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  const payload = await request.json().catch(() => ({}));
  const updated = updateWedding(weddingId, payload);
  if (!updated) {
    return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}
