import { NextResponse } from 'next/server';
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
    // The Supabase Wedding schema has no scenario-note column; echo it back without persisting.
    const scenarioNote = String(body?.scenarioNote || '');
    return NextResponse.json({ ok: true, scenarioNote });
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 400 });
  }
}
