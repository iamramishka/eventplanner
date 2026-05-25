/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import { addTable, db, getTablesByWedding } from '@/lib/store';
import { requireWeddingAccess } from '@/lib/rbac';

export async function GET(_: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  const wedding = db.weddings.findUnique((w: any) => w.id === weddingId);
  if (!wedding) return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
  const rows = getTablesByWedding(weddingId);
  return NextResponse.json({ ok: true, data: rows });
}

export async function POST(req: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  try {
    const wedding = db.weddings.findUnique((w: any) => w.id === weddingId);
    if (!wedding) return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
    const body = await req.json();
    const payload = { ...body, weddingId };
    const created = addTable(payload as any);
    return NextResponse.json({ ok: true, data: created });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 400 });
  }
}
