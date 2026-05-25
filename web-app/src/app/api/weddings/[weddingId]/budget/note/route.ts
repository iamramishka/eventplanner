import { NextResponse } from 'next/server';
import { updateBudgetScenarioNote } from '@/lib/store';
import { requireWeddingAccess } from '@/lib/rbac';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  try {
    const { weddingId } = await params;
    const access = await requireWeddingAccess(weddingId);
    if (access.response) return access.response;
    const body = await request.json();
    const scenarioNote = updateBudgetScenarioNote(weddingId, String(body?.scenarioNote || ''));
    if (scenarioNote === null) {
      return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, scenarioNote });
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 400 });
  }
}
