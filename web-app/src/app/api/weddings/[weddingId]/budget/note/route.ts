import { NextResponse } from 'next/server';
import { updateBudgetScenarioNote } from '@/lib/store';

export async function PATCH(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  try {
    const { weddingId } = await params;
    const body = await request.json();
    const scenarioNote = updateBudgetScenarioNote(weddingId, String(body?.scenarioNote || ''));
    if (scenarioNote === null) {
      return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, scenarioNote });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: String(error?.message || error) }, { status: 400 });
  }
}
