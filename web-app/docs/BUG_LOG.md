# Bug Log & Status

Summary: During the end-to-end regression runs I executed the smoke suite and resolved a blocking gap in webhook persistence. No failing tests remain.

Open / recently fixed issues

1. Stripe webhook persistence (fixed)
   - Symptom: sandbox webhook events sometimes lacked an email and the webhook handler only logged events instead of saving subscription records.
   - Action: Updated `web-app/src/app/api/webhooks/stripe/route.ts` to call `saveSubscription` for `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.*` events. Added fallback persistence under key `customer:<customerId>` when email is absent.
   - Status: Fixed and validated via `web-app/scripts/test_task91_billing_smoke.js`. `web-app/data/billing.json` shows saved records.

2. Windows PowerShell npm policy (workaround)
   - Symptom: `npm` scripts failed under PowerShell due to execution policy (PSSecurityException).
   - Action: Use `node scripts/*.js` to run smoke scripts locally or run PowerShell with `-ExecutionPolicy Bypass` when invoking `npm`.
   - Status: Workaround applied in local runs; recommend documenting in CONTRIBUTING.md.

3. Duplicate dev server PID binding (observed earlier)
   - Symptom: Next dev server intermittently bound to unexpected ports due to duplicate processes.
   - Action: Killed duplicate process during local runs; recommend ensuring a single dev server per workspace or using explicit PORT env.
   - Status: Resolved locally; non-blocking.

Low-priority / future items
 - Consider adding subscription->user linking in the app user/vendor stores so UI can reflect billing state automatically.
 - Improve sandbox webhook payloads to include email for a clearer test flow.
 - Add CI job to run the smoke/regression suite automatically on PRs or commits.
