import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { getAllPointRequests, reviewPointRequest } from '@/lib/vendorStore';

export async function GET() {
  const guard = await requireRole(['SUPER_ADMIN']);
  if (guard.response) return guard.response;

  return NextResponse.json({ requests: getAllPointRequests() });
}

export async function PATCH(req: NextRequest) {
  const guard = await requireRole(['SUPER_ADMIN']);
  if (guard.response) return guard.response;

  try {
    const body = await req.json();
    const requestId = String(body.requestId || '').trim();
    const action = String(body.action || '') as 'approve' | 'reject';
    const reviewNote = body.reviewNote ? String(body.reviewNote).trim() : undefined;

    if (!requestId) return NextResponse.json({ error: 'requestId is required.' }, { status: 400 });
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'action must be "approve" or "reject".' }, { status: 400 });
    }

    const updated = reviewPointRequest(requestId, action, reviewNote);
    if (!updated) {
      return NextResponse.json({ error: 'Point request not found or already reviewed.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, request: updated });
  } catch (err) {
    console.error('[PATCH /api/admin/points/requests]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
