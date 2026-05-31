import { NextRequest, NextResponse } from 'next/server';
import { getEntitlements, PlanType } from '@/lib/plans';
import { requireSuperAdmin } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const access = await requireSuperAdmin();
  if (access.response) return access.response;
  const { searchParams } = new URL(req.url);
  const requestedPlan = searchParams.get('plan');
  const plan: PlanType = requestedPlan === 'premium' ? 'premium' : 'trial';

  const entitlements = getEntitlements(plan);

  return NextResponse.json({
    plan,
    entitlements,
  });
}
