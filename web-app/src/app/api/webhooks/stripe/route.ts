import { NextResponse } from 'next/server';
import { auditLog } from '@/lib/audit';
import { constructEventFromRequest } from '@/lib/stripe';
import { saveSubscription } from '@/lib/billingStore';

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function nestedString(value: unknown, path: string[]) {
  let current: unknown = value;
  for (const key of path) {
    current = objectValue(current)[key];
  }
  return typeof current === 'string' ? current : null;
}

function extractEmail(obj: unknown) {
  return (
    nestedString(obj, ['customer_details', 'email']) ||
    nestedString(obj, ['customer_email']) ||
    nestedString(obj, ['billing_details', 'email']) ||
    nestedString(obj, ['metadata', 'email']) ||
    null
  );
}

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') || '';
  try {
    const event = await constructEventFromRequest(req, sig);

    await auditLog({ event: 'stripe.webhook.received', type: event.type || 'unknown', id: event.id || null });

    // Handle a selection of events we care about
    const t = event.type;

    if (t === 'checkout.session.completed' || t === 'checkout.session.async_payment_succeeded') {
      const session = event.data?.object || event;
      await auditLog({ event: 'checkout.session.completed', sessionId: session.id, customer: session.customer, subscription: session.subscription });

      const email = extractEmail(session);
      const customerId = session.customer || null;
      const subscriptionId = session.subscription || null;
      const status = session.payment_status === 'paid' ? 'active' : session.status || 'active';

      if (email) {
        const rec = saveSubscription(email, { customerId, subscriptionId, status });
        await auditLog({ event: 'billing.subscription.saved', email, customerId, subscriptionId, status, rec });
      } else if (customerId) {
        const key = `customer:${customerId}`;
        const rec = saveSubscription(key, { customerId, subscriptionId, status });
        await auditLog({ event: 'billing.subscription.saved', key, customerId, subscriptionId, status, rec });
      } else {
        await auditLog({ event: 'billing.subscription.skipped', reason: 'no_email_no_customer', customerId, subscriptionId });
      }
    }

    if (t === 'invoice.payment_succeeded') {
      const invoice = event.data?.object;
      await auditLog({ event: 'invoice.payment_succeeded', invoiceId: invoice?.id, subscription: invoice?.subscription });

      const email = extractEmail(invoice);
      const customerId = invoice?.customer || null;
      const subscriptionId = invoice?.subscription || null;
      const status = 'active';

      if (email) {
        const rec = saveSubscription(email, { customerId, subscriptionId, status });
        await auditLog({ event: 'billing.subscription.saved', email, customerId, subscriptionId, status, rec });
      } else if (customerId) {
        const key = `customer:${customerId}`;
        const rec = saveSubscription(key, { customerId, subscriptionId, status });
        await auditLog({ event: 'billing.subscription.saved', key, customerId, subscriptionId, status, rec });
      } else {
        await auditLog({ event: 'billing.subscription.skipped', reason: 'no_email_on_invoice_no_customer', customerId, subscriptionId });
      }
    }

    if (t === 'customer.subscription.updated' || t === 'customer.subscription.created') {
      const sub = event.data?.object;
      await auditLog({ event: 'subscription.updated', subscriptionId: sub?.id, status: sub?.status });

      const email = extractEmail(sub) || null;
      const customerId = sub?.customer || null;
      const subscriptionId = sub?.id || sub?.subscription || null;
      const status = sub?.status || 'active';

      if (email) {
        const rec = saveSubscription(email, { customerId, subscriptionId, status });
        await auditLog({ event: 'billing.subscription.saved', email, customerId, subscriptionId, status, rec });
      } else if (customerId) {
        const key = `customer:${customerId}`;
        const rec = saveSubscription(key, { customerId, subscriptionId, status });
        await auditLog({ event: 'billing.subscription.saved', key, customerId, subscriptionId, status, rec });
      } else {
        await auditLog({ event: 'billing.subscription.skipped', reason: 'no_email_on_subscription_no_customer', customerId, subscriptionId });
      }
    }

    return NextResponse.json({ received: true });
  } catch (e: unknown) {
    console.error('webhook handler error', e);
    await auditLog({ event: 'stripe.webhook.error', error: String(e) });
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
