import { NextResponse } from 'next/server';
import { dbSelect } from '@/lib/supabase-db';
import { listBudgetItems } from '@/lib/wedding-data';
import { requireWeddingAccess } from '@/lib/rbac';

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
  const wedding = await dbSelect<{ id: string }>('Wedding', { id: `eq.${weddingId}` }, 'id', 1);
  if (!wedding[0]) {
    return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
  }

  const header = ['category', 'item name', 'estimated', 'actual', 'status', 'notes'];
  const rows = (await listBudgetItems(weddingId) as unknown as BudgetExportRow[]).map((item) => [
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
