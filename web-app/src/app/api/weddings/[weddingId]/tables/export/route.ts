/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import { db, getTablesByWedding } from '@/lib/store';

function csvCell(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export async function GET(_: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const wedding = db.weddings.findUnique((w: any) => w.id === weddingId);
  if (!wedding) {
    return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
  }

  const guests = db.guests.findMany((guest: any) => guest.weddingId === weddingId);
  const guestById = new Map(guests.map((guest: any) => [guest.id, guest]));
  const assignedIds = new Set<string>();
  const rows = [
    ['section', 'table name', 'capacity', 'assigned count', 'guest name', 'guest id'],
  ];

  for (const table of getTablesByWedding(weddingId)) {
    const assignedGuestIds = Array.isArray(table.assignedGuestIds) ? table.assignedGuestIds : [];
    if (assignedGuestIds.length === 0) {
      rows.push(['table', table.name, String(table.capacity || 0), '0', '', '']);
      continue;
    }

    for (const guestId of assignedGuestIds) {
      assignedIds.add(guestId);
      const guest = guestById.get(guestId);
      rows.push([
        'table',
        table.name,
        String(table.capacity || 0),
        String(assignedGuestIds.length),
        guest?.name || 'Unknown guest',
        guestId,
      ]);
    }
  }

  for (const guest of guests.filter((guest: any) => !assignedIds.has(guest.id))) {
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
