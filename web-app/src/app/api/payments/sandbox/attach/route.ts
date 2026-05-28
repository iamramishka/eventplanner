import { NextResponse } from 'next/server';
import { saveSubscription } from '../../../../../lib/billingStore';
import { auditLog } from '../../../../../lib/audit';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.email;
    const customerId = body?.customerId || null;
    const subscriptionId = body?.subscriptionId || null;
    const status = body?.status || 'active';

    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    const rec = saveSubscription(email, { customerId, subscriptionId, status });
    await auditLog({ event: 'billing.attach', email, customerId, subscriptionId, status });
    return NextResponse.json(rec);
  } catch (e: unknown) {
    await auditLog({ event: 'billing.attach.error', error: String(e) });
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
