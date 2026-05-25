import { NextResponse } from 'next/server';
import { db, exportBudgetRows } from '@/lib/store';
import { requireWeddingAccess } from '@/lib/rbac';

type StoreRow = {
  id?: unknown;
};

type BudgetExportRow = {
  category?: unknown;
  name?: unknown;
  estimated?: unknown;
  actual?: unknown;
  status?: unknown;
  notes?: unknown;
};

function csvCell(value: unknown) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export async function GET(_: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  const wedding = db.weddings.findUnique((w: StoreRow) => w.id === weddingId);
  if (!wedding) {
    return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
  }

  const header = ['category', 'item name', 'estimated', 'actual', 'status', 'notes'];
  const rows = (exportBudgetRows(weddingId) as BudgetExportRow[]).map((item) => [
    item.category,
    item.name,
    item.estimated,
    item.actual,
    item.status,
    item.notes,
  ]);
  const csv = [header, ...rows].map(row => row.map(csvCell).join(',')).join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="budget-${weddingId}.csv"`,
    },
  });
}
