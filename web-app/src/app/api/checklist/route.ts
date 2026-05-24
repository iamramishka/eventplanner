import { NextResponse } from 'next/server';
import { addChecklistItem, getChecklistByWedding, getChecklistTemplates } from '@/lib/store';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const weddingId = url.searchParams.get('weddingId');
  if (!weddingId) return NextResponse.json({ ok: false, error: 'weddingId required' }, { status: 400 });

  return NextResponse.json({
    weddingId,
    items: getChecklistByWedding(weddingId),
    templates: getChecklistTemplates(),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = addChecklistItem(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }
}
