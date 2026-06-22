import { NextResponse } from 'next/server';
import { listTables, listGuests, getWeddingRow } from '@/lib/wedding-data';
import { requireWeddingAccess } from '@/lib/rbac';

function csvCell(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export async function GET(_: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  const wedding = await getWeddingRow(weddingId);
  if (!wedding) {
    return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
  }

  const [guests, tables] = await Promise.all([listGuests(weddingId), listTables(weddingId)]);
  const guestById = new Map(guests.map((guest) => [guest.id, guest]));
  const assignedIds = new Set<string>();
  const rows: string[][] = [
    ['section', 'table name', 'capacity', 'assigned count', 'guest name', 'guest id'],
  ];

  for (const table of tables) {
    const assignedGuestIds = table.assignedGuestIds;
    if (assignedGuestIds.length === 0) {
      rows.push(['table', table.name, String(table.capacity || 0), '0', '', '']);
      continue;
    }
    for (const guestId of assignedGuestIds) {
      assignedIds.add(guestId);
      const guest = guestById.get(guestId);
      rows.push(['table', table.name, String(table.capacity || 0), String(assignedGuestIds.length), guest?.name || 'Unknown guest', guestId]);
    }
  }

  for (const guest of guests.filter((guest) => !assignedIds.has(guest.id))) {
    rows.push(['unassigned', '', '', '', guest.name, guest.id]);
  }

  const csv = `${rows.map(row => row.map(csvCell).join(',')).join('\n')}\n`;
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${wedding.slug || weddingId}-seating-chart.csv"`,
    },
  });
}
