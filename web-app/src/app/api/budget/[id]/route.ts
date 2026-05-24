import { NextResponse } from 'next/server';
import { deleteBudgetItem, updateBudgetItem } from '@/lib/store';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateBudgetItem(id, body);
    if (!updated) {
      return NextResponse.json({ ok: false, error: 'Budget item not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = deleteBudgetItem(id);
  if (!removed) {
    return NextResponse.json({ ok: false, error: 'Budget item not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, removed });
}
