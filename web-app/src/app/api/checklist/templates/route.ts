import { NextResponse } from 'next/server';
import { applyChecklistTemplate } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.weddingId) return NextResponse.json({ ok: false, error: 'weddingId required' }, { status: 400 });
    if (!body?.templateId) return NextResponse.json({ ok: false, error: 'templateId required' }, { status: 400 });

    return NextResponse.json(applyChecklistTemplate(body.weddingId, body.templateId), { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 400 });
  }
}
