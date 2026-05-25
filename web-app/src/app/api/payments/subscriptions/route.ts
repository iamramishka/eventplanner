import { NextResponse } from 'next/server';
import { auditLog } from '../../../../lib/audit';
import { getAdminSettings } from '../../../../lib/adminSettings';

export async function GET() {
  // Return basic billing config for the client
  try {
    const premiumPlan = getAdminSettings().plans.find((plan) => plan.id === 'premium');
    const priceId = premiumPlan?.billingPriceId || process.env.BILLING_DEFAULT_PRICE_ID || null;
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || null;
    return NextResponse.json({
      priceId,
      publishableKey,
      plan: premiumPlan ? {
        id: premiumPlan.id,
        name: premiumPlan.name,
        price: premiumPlan.price,
        description: premiumPlan.description,
      } : null,
    });
  } catch (e: any) {
    await auditLog({ event: 'billing.config.error', error: String(e) });
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
