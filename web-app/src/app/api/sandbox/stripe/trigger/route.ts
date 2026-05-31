import { NextResponse } from 'next/server';
import { auditLog } from '@/lib/audit';
import { POST as webhookPOST } from '@/app/api/webhooks/stripe/route';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = body || { type: 'checkout.session.completed', id: 'evt_sandbox_1', data: { object: {} } };

    // Log the sent sandbox event
    await auditLog({ event: 'sandbox.webhook.sent', type: event.type, id: event.id || null });

    // Call the existing webhook handler directly (it accepts test-mode raw bodies)
    const fakeReq = new Request('http://internal/sandbox-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    const resp = await webhookPOST(fakeReq);
    return resp || NextResponse.json({ ok: true });
  } catch (e: unknown) {
    await auditLog({ event: 'sandbox.webhook.error', error: String(e) });
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
