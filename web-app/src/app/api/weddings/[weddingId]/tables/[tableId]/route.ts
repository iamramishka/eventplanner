/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import { deleteTable, updateTable } from '@/lib/store';

export async function PUT(req: Request, { params }: { params: Promise<{ weddingId: string; tableId: string }> }) {
  const { tableId } = await params;
  try {
    const body = await req.json();
    const updated = updateTable(tableId, body as any);
    if (!updated) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ weddingId: string; tableId: string }> }) {
  const { tableId } = await params;
  const deleted = deleteTable(tableId);
  if (!deleted) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, data: deleted });
}
