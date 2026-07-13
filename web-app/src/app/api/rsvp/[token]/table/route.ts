import { NextResponse } from 'next/server';
import { findTableForGuest, getGuestByToken, getWeddingRow } from '@/lib/wedding-data';

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const guest = await getGuestByToken(token);
  const wedding = guest ? await getWeddingRow(guest.weddingId) : null;

  if (!guest || !wedding) {
    return NextResponse.json({ ok: false, error: 'Invalid invitation token' }, { status: 404 });
  }

  const table = await findTableForGuest(wedding.id, guest.id);
  const assignedCount = table ? table.assignedGuestIds.length : 0;

  return NextResponse.json({
    ok: true,
    guest: { name: guest.name },
    table: table
      ? { id: table.id, name: table.name, capacity: Number(table.capacity || 0), assignedCount }
      : null,
  });
}
