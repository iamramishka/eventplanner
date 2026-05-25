import { NextRequest, NextResponse } from 'next/server';
import { getEntitlements, PlanType } from '@/lib/plans';
import { requireSuperAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const forbidden = await requireSuperAdmin();
  if (forbidden) return forbidden;
  const { searchParams } = new URL(req.url);
  const requestedPlan = searchParams.get('plan');
  const plan: PlanType = requestedPlan === 'premium' ? 'premium' : 'trial';

  const entitlements = getEntitlements(plan);
  
  return NextResponse.json({
    plan,
    entitlements,
  });
}
