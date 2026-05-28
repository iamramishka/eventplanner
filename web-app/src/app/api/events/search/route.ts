import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.toLowerCase() || '';

    if (!q || q.length < 2) {
      return NextResponse.json({ ok: true, events: [] });
    }

    const matched = db.weddings.findMany((w) => {
      const groom = (w.groomName || '').toLowerCase();
      const bride = (w.brideName || '').toLowerCase();
      const title = (w.weddingTitle || '').toLowerCase();
      const slug = (w.slug || '').toLowerCase();
      const id = (w.id || '').toLowerCase();
      const couple = `${groom} ${bride}`;
      const coupleRev = `${bride} ${groom}`;

      return (
        groom.includes(q) ||
        bride.includes(q) ||
        title.includes(q) ||
        couple.includes(q) ||
        coupleRev.includes(q) ||
        slug.includes(q) ||
        id === q
      );
    });

    const events = matched.map((w) => ({
      id: w.id,
      groomName: w.groomName,
      brideName: w.brideName,
      weddingTitle: w.weddingTitle,
      date: w.date,
      venueName: w.venueName,
      slug: w.slug,
      profileImage: w.profileImage,
    }));

    return NextResponse.json({ ok: true, events });
  } catch (e) {
    console.error('search-events error', e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
