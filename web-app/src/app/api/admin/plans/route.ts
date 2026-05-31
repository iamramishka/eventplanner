import { NextResponse } from 'next/server';
import { getAdminSettings, saveAdminPlans, type AdminPlan } from '@/lib/adminSettings';
import { auditLog } from '@/lib/audit';
import { requireSuperAdmin } from '@/lib/rbac';
import stripe from '@/lib/stripe';

function parsePriceToCents(price: string) {
  const match = price.replace(/,/g, '').match(/(\d+(?:\.\d{1,2})?)/);
  if (!match) return null;
  const amount = Math.round(Number(match[1]) * 100);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

async function syncStripePrices(plans: AdminPlan[]) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required to sync Stripe prices');
  }

  const synced = [];
  for (const plan of plans) {
    const unitAmount = parsePriceToCents(plan.price);
    if (!unitAmount) {
      synced.push(plan);
      continue;
    }

    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: { adminPlanId: plan.id },
    });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: unitAmount,
      currency: plan.billingCurrency || 'usd',
      recurring: { interval: plan.billingInterval || 'month' },
      metadata: { adminPlanId: plan.id },
    });

    synced.push({ ...plan, billingPriceId: price.id });
  }
  return synced;
}

export async function GET() {
  const access = await requireSuperAdmin();
  if (access.response) return access.response;
  return NextResponse.json({ ok: true, data: { plans: getAdminSettings().plans } });
}

export async function PUT(req: Request) {
  try {
    const access = await requireSuperAdmin();
    if (access.response) return access.response;
    const body = await req.json();
    const plans = body?.plans as AdminPlan[] | undefined;
    if (!Array.isArray(plans) || plans.length === 0) {
      return NextResponse.json({ ok: false, error: 'plans array required' }, { status: 400 });
    }

    let updated = saveAdminPlans(plans);
    let stripeSynced = false;
    if (body?.syncStripe === true) {
      const syncedPlans = await syncStripePrices(updated.plans);
      updated = saveAdminPlans(syncedPlans);
      stripeSynced = true;
    }

    await auditLog({
      action: 'admin-plans-update',
      targetId: 'plans',
      data: { planIds: updated.plans.map((plan) => plan.id), syncStripe: body?.syncStripe === true, stripeSynced },
    });
    return NextResponse.json({ ok: true, data: { plans: updated.plans, updatedAt: updated.updatedAt, stripeSynced } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
