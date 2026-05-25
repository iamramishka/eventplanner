import { NextResponse } from 'next/server';
import { getAdminSettings, saveAdminPlans, type AdminPlan } from '@/lib/adminSettings';
import { auditLog } from '@/lib/audit';
import { requireSuperAdmin } from '@/lib/adminAuth';

export async function GET() {
  const forbidden = await requireSuperAdmin();
  if (forbidden) return forbidden;
  return NextResponse.json({ ok: true, data: { plans: getAdminSettings().plans } });
}

export async function PUT(req: Request) {
  try {
    const forbidden = await requireSuperAdmin();
    if (forbidden) return forbidden;
    const body = await req.json();
    const plans = body?.plans as AdminPlan[] | undefined;
    if (!Array.isArray(plans) || plans.length === 0) {
      return NextResponse.json({ ok: false, error: 'plans array required' }, { status: 400 });
    }

    const updated = saveAdminPlans(plans);
    await auditLog({ action: 'admin-plans-update', targetId: 'plans', data: { planIds: plans.map((plan) => plan.id) } });
    return NextResponse.json({ ok: true, data: { plans: updated.plans, updatedAt: updated.updatedAt } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
