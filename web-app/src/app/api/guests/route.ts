import { NextResponse } from 'next/server';
import { db, addGuest } from '@/lib/store';
import { requireWeddingAccess } from '@/lib/rbac';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const weddingId = url.searchParams.get('weddingId') || undefined;
  if (!weddingId) return NextResponse.json({ ok: false, error: 'weddingId required' }, { status: 400 });
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  const search = (url.searchParams.get('search') || '').toLowerCase();
  const side = url.searchParams.get('side') || undefined;

  let results = db.guests.findMany(g => g.weddingId === weddingId);
  if (side) results = results.filter(r => (r.side || '').toLowerCase() === side.toLowerCase());
  if (search) results = results.filter(r => (r.name || '').toLowerCase().includes(search) || (r.whatsapp || '').includes(search));

  return NextResponse.json(results);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.weddingId) return NextResponse.json({ ok: false, error: 'weddingId required' }, { status: 400 });
    const access = await requireWeddingAccess(String(body.weddingId));
    if (access.response) return access.response;
    if (!body?.name) return NextResponse.json({ ok: false, error: 'name required' }, { status: 400 });

    const created = addGuest(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 400 });
  }
}
