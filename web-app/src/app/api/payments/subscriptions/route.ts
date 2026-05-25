import { NextResponse } from 'next/server';
import { auditLog } from '@/lib/audit';

export async function GET() {
  // Return basic billing config for the client
  try {
    const priceId = process.env.BILLING_DEFAULT_PRICE_ID || null;
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || null;
    return NextResponse.json({ priceId, publishableKey });
  } catch (e: unknown) {
    await auditLog({ event: 'billing.config.error', error: String(e) });
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
