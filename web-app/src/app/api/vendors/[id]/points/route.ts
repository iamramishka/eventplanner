import { NextRequest, NextResponse } from 'next/server';
import { requireVendorAccess } from '@/lib/rbac';
import { addPoints, getPointsBalance } from '@/lib/vendorStore';

// Sandbox only — in production this would go through Stripe checkout
// ─── POST /api/vendors/[id]/points ───────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const guard = await requireVendorAccess(id);
  if (guard.response) return guard.response;

  try {
    const body = await req.json();
    const amount = Number(body.amount || 0);
    if (!Number.isInteger(amount) || amount < 1 || amount > 500) {
      return NextResponse.json(
        { error: 'amount must be an integer between 1 and 500.' },
        { status: 400 }
      );
    }

    addPoints(id, amount);
    return NextResponse.json({ ok: true, points: getPointsBalance(id) });
  } catch (err) {
    console.error('[POST /api/vendors/[id]/points]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
