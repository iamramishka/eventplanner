# Billing / Stripe Integration (Test Mode)

This document describes local test-mode steps to exercise the Stripe checkout and webhook flows implemented for Task 9.1.

Environment variables
- `STRIPE_SECRET_KEY` - your Stripe secret key (test key starts with `sk_test_...`).
- `STRIPE_PUBLISHABLE_KEY` - client publishable key (optional for Checkout flow).
- `STRIPE_WEBHOOK_SECRET` - webhook signing secret (optional for test-mode; if omitted the webhook handler accepts JSON payloads).
- `BILLING_DEFAULT_PRICE_ID` - Price ID for the subscription to use in Checkout sessions.
- `BILLING_SUCCESS_URL` - URL to redirect after successful checkout.
- `BILLING_CANCEL_URL` - URL to redirect after canceled checkout.

Local test steps
1. Start the dev server:

```bash
cd "web-app"
npm run dev
```

2. Create a Checkout Session by visiting the couple checkout page: `/account/checkout` (in the Couple area). Fill in an email and submit.

3. Use Stripe test cards (e.g. `4242 4242 4242 4242`) on the hosted Checkout page.

4. Webhooks: to exercise webhook handling use the Stripe CLI or post a JSON payload directly if `STRIPE_WEBHOOK_SECRET` is not set.

Example using Stripe CLI:

```bash
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
# then trigger a test event
stripe trigger checkout.session.completed
```

Sandbox APIs (no Stripe keys required)
- `POST /api/sandbox/stripe/customers` - create a mock customer. Body: `{ "email": "user@example.com" }`.
- `POST /api/sandbox/stripe/checkout` - create a mock Checkout Session. Body: `{ "priceId": "price_x", "customerEmail": "user@example.com" }`.
- `POST /api/sandbox/stripe/trigger` - simulate Stripe sending a webhook to `/api/webhooks/stripe`. Body: a Stripe-like event JSON (e.g. `{ "type": "checkout.session.completed", "data": { "object": { ... } } }`).

- `POST /api/payments/sandbox/attach` - attach/save a sandbox subscription record to an email. Body: `{ "email": "user@example.com", "customerId": "cus_...", "subscriptionId": "sub_...", "status": "active" }`.
- `GET /api/payments/billing/:email` - retrieve saved subscription record for `:email`.

These sandbox endpoints write audit entries to `web-app/logs/audit.log` and call the internal webhook handler so you can test end-to-end flows without configuring Stripe.

Troubleshooting
- If webhook signature verification fails, confirm `STRIPE_WEBHOOK_SECRET` matches the secret shown by `stripe listen`.
- All billing events are recorded to the audit log at `web-app/logs/audit.log` for traceability.
