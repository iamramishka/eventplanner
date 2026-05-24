import { NextResponse } from 'next/server';
import { db, updateWedding } from '@/lib/store';

export async function GET(_: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const wedding = db.weddings.findUnique((w) => w.id === weddingId);
  if (!wedding) {
    return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
  }
  return NextResponse.json(wedding);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const payload = await request.json().catch(() => ({}));
  const updated = updateWedding(weddingId, payload);
  if (!updated) {
    return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}
