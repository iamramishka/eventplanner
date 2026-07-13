import { NextResponse } from 'next/server';
import { applyChecklistTemplateById } from '@/lib/wedding-data';
import { requireWeddingAccess } from '@/lib/rbac';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.weddingId) return NextResponse.json({ ok: false, error: 'weddingId required' }, { status: 400 });
    const access = await requireWeddingAccess(String(body.weddingId));
    if (access.response) return access.response;
    if (!body?.templateId) return NextResponse.json({ ok: false, error: 'templateId required' }, { status: 400 });

    return NextResponse.json(await applyChecklistTemplateById(String(body.weddingId), String(body.templateId)), { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 400 });
  }
}
