import { NextResponse } from 'next/server';
import { deleteBudgetItemRow, updateBudgetItemRow } from '@/lib/wedding-data';
import { requireBudgetItemAccess } from '@/lib/rbac';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = await requireBudgetItemAccess(id);
    if (access.response) return access.response;
    const body = await request.json();
    const updated = await updateBudgetItemRow(id, body);
    if (!updated) {
      return NextResponse.json({ ok: false, error: 'Budget item not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireBudgetItemAccess(id);
  if (access.response) return access.response;
  const removed = await deleteBudgetItemRow(id);
  if (!removed) {
    return NextResponse.json({ ok: false, error: 'Budget item not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
