import Stripe from 'stripe';
import { auditLog } from './audit';

const secret = process.env.STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const stripe = new Stripe(secret, { apiVersion: '2023-08-16' });

export default stripe;

export async function constructEventFromRequest(req: Request, sigHeader: string) {
  // If webhook signing secret is not set (test mode), accept the JSON body directly.
  if (!webhookSecret) {
    try {
      const body = await req.json();
      return body;
    } catch (e) {
      throw new Error('Unable to parse webhook body in test mode');
    }
  }

  const buf = Buffer.from(await req.arrayBuffer());
  try {
    return stripe.webhooks.constructEvent(buf, sigHeader, webhookSecret);
  } catch (e: any) {
    await auditLog({ event: 'stripe.webhook.verify_failed', error: String(e) });
    throw e;
  }
}
