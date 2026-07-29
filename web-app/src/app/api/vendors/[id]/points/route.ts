import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { getVendorById, addPoints, getPointsBalance } from '@/lib/vendorStore';

// Sandbox only — in production this would go through Stripe checkout
// ─── POST /api/vendors/[id]/points ───────────────────────────
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
