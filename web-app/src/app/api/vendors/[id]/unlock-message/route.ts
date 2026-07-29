import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import {
  getVendorById,
  getThreadById,
  deductPoints,
  unlockThread,
  getPointsBalance,
} from '@/lib/vendorStore';

const UNLOCK_COST = 5;

// ─── POST /api/vendors/[id]/unlock-message ────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole(['VENDOR', 'SUPER_ADMIN']);
  if (guard.response) return guard.response;

  try {
    const { id } = await params;

    if (!getVendorById(id)) {
      return NextResponse.json({ error: 'Vendor not found.' }, { status: 404 });
    }

    const body = await req.json();
    const threadId = String(body.threadId || '').trim();
    if (!threadId) {
      return NextResponse.json({ error: 'threadId is required.' }, { status: 400 });
    }

    const existing = getThreadById(id, threadId);
    if (!existing) {
      return NextResponse.json({ error: 'Message thread not found.' }, { status: 404 });
    }

    // Idempotent — already unlocked
    if (!existing.locked) {
      return NextResponse.json({ ok: true, points: getPointsBalance(id) });
    }

    const deducted = deductPoints(id, UNLOCK_COST);
    if (!deducted) {
      return NextResponse.json(
        { error: 'Insufficient points. Purchase more points to unlock this message.' },
        { status: 402 }
      );
    }

    unlockThread(id, threadId);

    return NextResponse.json({ ok: true, points: getPointsBalance(id) });
  } catch (err) {
    console.error('[POST /api/vendors/[id]/unlock-message]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
