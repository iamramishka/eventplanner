import { NextResponse } from 'next/server';
import { dbSelect } from '@/lib/supabase-db';

interface WeddingRow {
  id: string;
  groomFirstName: string;
  brideFirstName: string;
  eventDate: string | null;
  venueName: string | null;
  slug: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.toLowerCase() || '';

    if (!q || q.length < 2) {
      return NextResponse.json({ ok: true, events: [] });
    }

    const all = await dbSelect<WeddingRow>('Wedding', {}, 'id,groomFirstName,brideFirstName,eventDate,venueName,slug', 1000);
    const matched = all.filter((w) => {
      const groom = (w.groomFirstName || '').toLowerCase();
      const bride = (w.brideFirstName || '').toLowerCase();
      const slug = (w.slug || '').toLowerCase();
      const id = (w.id || '').toLowerCase();
      const couple = `${groom} ${bride}`;
      const coupleRev = `${bride} ${groom}`;
      return (
        groom.includes(q) || bride.includes(q) ||
        couple.includes(q) || coupleRev.includes(q) ||
        slug.includes(q) || id === q
      );
    });

    const events = matched.map((w) => ({
      id: w.id,
      groomName: w.groomFirstName,
      brideName: w.brideFirstName,
      weddingTitle: `${w.brideFirstName} & ${w.groomFirstName}`,
      date: w.eventDate ? w.eventDate.slice(0, 10) : '',
      venueName: w.venueName,
      slug: w.slug,
      profileImage: null,
    }));

    return NextResponse.json({ ok: true, events });
  } catch (e) {
    console.error('search-events error', e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
