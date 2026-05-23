import { NextRequest, NextResponse } from 'next/server';
import { getEntitlements, PlanType } from '@/lib/plans';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const plan = searchParams.get('plan') as PlanType || 'trial';

  const entitlements = getEntitlements(plan);
  
  return NextResponse.json({
    plan,
    entitlements,
  });
}
