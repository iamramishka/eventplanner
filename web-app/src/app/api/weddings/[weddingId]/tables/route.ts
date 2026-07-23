import { NextResponse } from 'next/server';
import { dbSelect } from '@/lib/supabase-db';
import { listTables, createTable } from '@/lib/wedding-data';
import { requireWeddingAccess } from '@/lib/rbac';

async function weddingExists(weddingId: string) {
  const rows = await dbSelect<{ id: string }>('Wedding', { id: `eq.${weddingId}` }, 'id', 1);
  return rows.length > 0;
}

export async function GET(_: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  if (!(await weddingExists(weddingId))) return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
  const rows = await listTables(weddingId);
  return NextResponse.json({ ok: true, data: rows });
}

export async function POST(req: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  try {
    if (!(await weddingExists(weddingId))) return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
    const body = await req.json();
    const created = await createTable(weddingId, body);
    return NextResponse.json({ ok: true, data: created });
  } catch (err: unknown) {
    return NextResponse.json({ ok: false, error: String(err instanceof Error ? err.message : err) }, { status: 400 });
  }
}
