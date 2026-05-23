import { NextResponse } from 'next/server';
import {
  db,
  findGuestForTableLookup,
  findTableForGuest,
  getGuestByToken,
} from '@/lib/store';

const GENERIC_ERROR = 'We could not verify those details. Please check your invitation link or ask the couple for help.';

function safeTableResult(guest: any, wedding: any) {
  const table = findTableForGuest(wedding.id, guest.id);
  const tableResult = table
    ? {
        name: table.name,
        notes: table.notes || '',
      }
    : null;

  return {
    ok: true,
    status: tableResult ? 'assigned' : 'unassigned',
    message: tableResult ? 'Your table is ready.' : 'Your table is not assigned yet.',
    wedding: {
      title: wedding.weddingTitle || `${wedding.brideName || ''} & ${wedding.groomName || ''}`.trim(),
      date: wedding.date || '',
      venueName: wedding.venueName || '',
      slug: wedding.slug,
    },
    guest: {
      name: guest.name,
    },
    table: tableResult,
  };
}

function genericVerificationError(status = 404) {
  return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status });
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const wedding = db.weddings.findUnique((item: any) => item.slug === slug);
    if (!wedding) return genericVerificationError();

    const body = await request.json().catch(() => ({}));
    const token = String(body?.token || '').trim();

    if (token) {
      const guest = getGuestByToken(token);
      if (!guest || guest.weddingId !== wedding.id) return genericVerificationError();
      return NextResponse.json(safeTableResult(guest, wedding));
    }

    const name = String(body?.name || '').trim();
    const phoneLast4 = String(body?.phoneLast4 || '').replace(/\D/g, '');
    if (!name || phoneLast4.length !== 4) {
      return genericVerificationError(400);
    }

    const guest = findGuestForTableLookup(wedding.id, name, phoneLast4);
    if (!guest) return genericVerificationError();

    return NextResponse.json(safeTableResult(guest, wedding));
  } catch {
    return genericVerificationError(400);
  }
}
