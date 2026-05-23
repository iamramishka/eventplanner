import { NextResponse } from 'next/server';
import { db, exportBudgetRows } from '@/lib/store';

function csvCell(value: any) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export async function GET(_: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const wedding = db.weddings.findUnique((w: any) => w.id === weddingId);
  if (!wedding) {
    return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
  }

  const header = ['category', 'item name', 'estimated', 'actual', 'status', 'notes'];
  const rows = exportBudgetRows(weddingId).map((item: any) => [
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
