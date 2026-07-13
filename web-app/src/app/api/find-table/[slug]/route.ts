import { NextResponse } from 'next/server';
import {
  findGuestForTableLookup,
  findTableForGuest,
  getGuestByToken,
  getWeddingBySlug,
  type GuestRow,
  type WeddingRow,
} from '@/lib/wedding-data';

const GENERIC_ERROR = 'We could not verify those details. Please check your invitation link or ask the couple for help.';

async function safeTableResult(guest: GuestRow, wedding: WeddingRow) {
  const table = await findTableForGuest(wedding.id, guest.id);
  const tableResult = table ? { name: table.name, notes: table.notes || '' } : null;

  return {
    ok: true,
    status: tableResult ? 'assigned' : 'unassigned',
    message: tableResult ? 'Your table is ready.' : 'Your table is not assigned yet.',
    wedding: {
      title: `${wedding.brideFirstName || ''} & ${wedding.groomFirstName || ''}`.trim(),
      date: wedding.eventDate ? wedding.eventDate.slice(0, 10) : '',
      venueName: wedding.venueName || '',
      slug: wedding.slug,
    },
    guest: { name: guest.name },
    table: tableResult,
  };
}

function genericVerificationError(status = 404) {
  return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status });
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const wedding = await getWeddingBySlug(slug);
    if (!wedding) return genericVerificationError();

    const body = await request.json().catch(() => ({}));
    const token = String(body?.token || '').trim();

    if (token) {
      const guest = await getGuestByToken(token);
      if (!guest || guest.weddingId !== wedding.id) return genericVerificationError();
      return NextResponse.json(await safeTableResult(guest, wedding));
    }

    const name = String(body?.name || '').trim();
    const phoneLast4 = String(body?.phoneLast4 || '').replace(/\D/g, '');
    if (!name || phoneLast4.length !== 4) {
      return genericVerificationError(400);
    }

    const guest = await findGuestForTableLookup(wedding.id, name, phoneLast4);
    if (!guest) return genericVerificationError();

    return NextResponse.json(await safeTableResult(guest, wedding));
  } catch {
    return genericVerificationError(400);
  }
}
