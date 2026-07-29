import { NextRequest, NextResponse } from 'next/server';
import { requireVendorAccess } from '@/lib/rbac';
import {
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
  const { id } = await params;
  const guard = await requireVendorAccess(id);
  if (guard.response) return guard.response;

  try {
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
