# Release Checklist

This checklist documents the minimal steps and verification performed for the current release candidate.

1. Code & build
   - [x] Run `npm run build` (verify build succeeds locally).
   - [x] Confirm server starts in dev (`npm run dev`) and routes compile.

2. Database & migrations
   - [x] Prisma generate/migrate applied in local dev (SQLite used for local verification).
   - [ ] For production, run `npx prisma migrate deploy` against Postgres and `npm run prisma:seed` if needed.

3. End-to-end tests (smoke/regression)
   - [x] Invitation smoke suite (test_task45) — passed
   - [x] RSVP token (test_task51) — passed
   - [x] Gallery flows (test_task52/53) — passed
   - [x] Sprint 5 QA (test_task54) — passed
   - [x] Planning tools (test_task61-65) — passed
   - [x] Table/Seating flows (test_task72-74) — passed
   - [x] Vendor onboarding & approval (test_task81-85) — passed
   - [x] Billing smoke (test_task91) — passed

4. Billing & payments
   - [x] Sandbox Stripe flows tested and webhook persistence implemented.
   - [ ] Ensure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are configured in production and webhooks are registered.

5. Logging & monitoring
   - [x] `web-app/logs/audit.log` contains recent smoke test traces.

6. Release artifacts
   - [x] `web-app/data/billing.json` updated by smoke tests (sandbox).
   - [x] Smoke test artifacts validated.

7. Post-release steps
   - [ ] Run full regression on a CI environment with production-like env (Postgres, Stripe test keys).
   - [ ] Deploy to staging and run manual exploratory QA on critical user journeys.

Notes:
- Local dev used a SQLite-compatible Prisma schema for migrations and smoke tests. Production requires Postgres.
- PowerShell execution policy may block `npm` scripts on Windows; CI or developer machines should run `npm` directly or use `-ExecutionPolicy Bypass` when necessary.
