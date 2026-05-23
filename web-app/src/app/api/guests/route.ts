import { NextResponse } from 'next/server';
import { db, addGuest } from '@/lib/store';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const weddingId = url.searchParams.get('weddingId') || undefined;
  const search = (url.searchParams.get('search') || '').toLowerCase();
  const side = url.searchParams.get('side') || undefined;

  let results = weddingId ? db.guests.findMany(g => g.weddingId === weddingId) : db.guests.findMany(() => true);
  if (side) results = results.filter(r => (r.side || '').toLowerCase() === side.toLowerCase());
  if (search) results = results.filter(r => (r.name || '').toLowerCase().includes(search) || (r.whatsapp || '').includes(search));

  return NextResponse.json(results);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.weddingId) return NextResponse.json({ ok: false, error: 'weddingId required' }, { status: 400 });
    if (!body?.name) return NextResponse.json({ ok: false, error: 'name required' }, { status: 400 });

    const created = addGuest(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 400 });
  }
}
