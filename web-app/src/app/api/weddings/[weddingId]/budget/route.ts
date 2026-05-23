import { NextResponse } from 'next/server';
import { addBudgetItem, db, getBudgetResponse } from '@/lib/store';

export async function GET(_: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const budget = getBudgetResponse(weddingId);
  if (!budget) {
    return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
  }

  return NextResponse.json(budget);
}

export async function POST(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  try {
    const { weddingId } = await params;
    const wedding = db.weddings.findUnique((w: any) => w.id === weddingId);
    if (!wedding) {
      return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
    }

    const body = await request.json();
    const item = addBudgetItem({ ...body, weddingId });
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: String(error?.message || error) }, { status: 400 });
  }
}
