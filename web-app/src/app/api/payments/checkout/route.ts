import { NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { auditLog } from '@/lib/audit';
import { createMockCheckoutSession } from '@/lib/sandboxStripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const priceId = body?.priceId || process.env.BILLING_DEFAULT_PRICE_ID;
    const customerEmail = body?.customerEmail || null;

    let session;
    const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

    if (!stripeConfigured) {
      // Use internal sandbox helper when Stripe is not configured
      session = createMockCheckoutSession(priceId || null, customerEmail);
      await auditLog({ event: 'checkout.session.sandbox_created', sessionId: session.id, customerEmail });
    } else {
      if (!priceId) {
        return NextResponse.json({ error: 'Missing priceId and no default configured' }, { status: 400 });
      }
      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: customerEmail || undefined,
        success_url: process.env.BILLING_SUCCESS_URL || 'http://localhost:3000/?billing_success=1',
        cancel_url: process.env.BILLING_CANCEL_URL || 'http://localhost:3000/?billing_cancel=1',
      });

      await auditLog({ event: 'checkout.session.created', sessionId: session.id, priceId, customerEmail });
    }

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (e: any) {
    console.error('checkout error', e);
    await auditLog({ event: 'checkout.session.error', error: String(e) });
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
