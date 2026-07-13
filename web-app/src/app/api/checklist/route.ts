import { NextResponse } from 'next/server';
import { listChecklist, createChecklistItem, getChecklistTemplates } from '@/lib/wedding-data';
import { requireWeddingAccess } from '@/lib/rbac';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const weddingId = url.searchParams.get('weddingId');
  if (!weddingId) return NextResponse.json({ ok: false, error: 'weddingId required' }, { status: 400 });
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;

  return NextResponse.json({
    weddingId,
    items: await listChecklist(weddingId),
    templates: getChecklistTemplates(),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.weddingId) return NextResponse.json({ ok: false, error: 'weddingId required' }, { status: 400 });
    const access = await requireWeddingAccess(String(body.weddingId));
    if (access.response) return access.response;
    const created = await createChecklistItem(String(body.weddingId), body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 400 });
  }
}
