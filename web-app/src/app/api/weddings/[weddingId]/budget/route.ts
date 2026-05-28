import { NextResponse } from 'next/server';
import { addBudgetItem, db, getBudgetResponse } from '@/lib/store';
import { requireWeddingAccess } from '@/lib/rbac';

type StoreRow = {
  id?: unknown;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function GET(_: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  const budget = getBudgetResponse(weddingId);
  if (!budget) {
    return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
  }

  return NextResponse.json(budget);
}

export async function POST(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  try {
    const { weddingId } = await params;
    const access = await requireWeddingAccess(weddingId);
    if (access.response) return access.response;
    const wedding = db.weddings.findUnique((w: StoreRow) => w.id === weddingId);
    if (!wedding) {
      return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
    }

    const body = await request.json();
    const item = addBudgetItem({ ...body, weddingId });
    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 400 });
  }
}
