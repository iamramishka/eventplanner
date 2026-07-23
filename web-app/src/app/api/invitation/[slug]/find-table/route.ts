import { NextResponse } from 'next/server';
import { getWeddingBySlug, findTableForGuest, type GuestRow } from '@/lib/wedding-data';
import { dbSelect } from '@/lib/supabase-db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const wedding = await getWeddingBySlug(slug);
    if (!wedding) return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const name = String(body?.name || '').trim().toLowerCase();
    if (!name || name.length < 2) {
      return NextResponse.json({ ok: false, error: 'Enter at least 2 characters.' }, { status: 400 });
    }

    const guests = await dbSelect<GuestRow>('Guest', { weddingId: `eq.${wedding.id}` }, '*', 1000);
    const matched = guests.filter((g) =>
      (g.name || '').trim().toLowerCase().includes(name),
    );

    if (matched.length === 0) {
      return NextResponse.json({ ok: true, results: [] });
    }

    const results = await Promise.all(
      matched.map(async (g) => {
        const table = await findTableForGuest(wedding.id, g.id);
        return {
          guestName: g.name,
          tableName: table?.name || null,
          token: g.inviteToken || null,
        };
      }),
    );

    return NextResponse.json({ ok: true, results });
  } catch {
    return NextResponse.json({ ok: false, error: 'Search failed. Please try again.' }, { status: 500 });
  }
}
