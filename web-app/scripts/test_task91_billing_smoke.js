// Minimal smoke test for billing: create a Checkout Session and (optionally) POST a test webhook.
const fetch = global.fetch || require('node-fetch');

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function run() {
  console.log('Billing smoke: using BASE =', BASE);
  try {
    const res = await fetch(`${BASE}/api/payments/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerEmail: 'test+billing@local' }),
    });
    const data = await res.json();
    console.log('checkout response:', data);

    if (data?.url) {
      console.log('Checkout created. Open the URL in a browser to complete payment:', data.url);
    }

    // Optionally POST a simulated webhook if webhook secret is not configured
    console.log('Posting simulated webhook payload (accepted in test mode)...');
    const webhookRes = await fetch(`${BASE}/api/webhooks/stripe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'checkout.session.completed', id: 'test_evt_1', data: { object: { id: data?.id || 'sess_test', customer: 'cus_test', subscription: 'sub_test' } } }),
    });
    console.log('webhook response', await webhookRes.text());

    console.log('Billing smoke finished. Check web-app/logs/audit.log for recorded events.');
  } catch (e) {
    console.error('billing smoke error', e);
    process.exitCode = 2;
  }
}

run();
