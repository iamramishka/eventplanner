import { NextResponse } from 'next/server';
import { dbSelect } from '@/lib/supabase-db';
import { getBudgetResponse, addBudgetItemRow } from '@/lib/wedding-data';
import { requireWeddingAccess } from '@/lib/rbac';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function weddingExists(weddingId: string) {
  const rows = await dbSelect<{ id: string }>('Wedding', { id: `eq.${weddingId}` }, 'id', 1);
  return rows.length > 0;
}

export async function GET(_: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  if (!(await weddingExists(weddingId))) {
    return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
  }
  return NextResponse.json(await getBudgetResponse(weddingId));
}

export async function POST(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  try {
    const { weddingId } = await params;
    const access = await requireWeddingAccess(weddingId);
    if (access.response) return access.response;
    if (!(await weddingExists(weddingId))) {
      return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
    }

    const body = await request.json();
    const item = await addBudgetItemRow(weddingId, body);
    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 400 });
  }
}
