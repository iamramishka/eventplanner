import { NextResponse } from 'next/server';
import { findTableForGuest, getGuestByToken, getWeddingForGuest } from '@/lib/store';

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const guest = getGuestByToken(token);
  const wedding = guest ? getWeddingForGuest(guest) : null;

  if (!guest || !wedding) {
    return NextResponse.json({ ok: false, error: 'Invalid invitation token' }, { status: 404 });
  }

  if (wedding.sections?.tableFinder === false) {
    return NextResponse.json({ ok: false, error: 'Table lookup is not available for this wedding' }, { status: 404 });
  }

  const table = findTableForGuest(wedding.id, guest.id);
  const assignedCount = table && Array.isArray(table.assignedGuestIds) ? table.assignedGuestIds.length : 0;

  return NextResponse.json({
    ok: true,
    guest: {
      name: guest.name,
    },
    table: table
      ? {
          id: table.id,
          name: table.name,
          capacity: Number(table.capacity || 0),
          assignedCount,
        }
      : null,
  });
}
