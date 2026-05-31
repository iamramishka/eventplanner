# Release Checklist — WedPlan v1.0

Last updated: 2026-05-30

## ✅ Gates Passed

### 1. Build
- [x] `npm run build` passes — 42 routes, TypeScript clean, 0 errors
- [x] `npm run lint` passes — 0 errors (291 warnings documented as debt, see Bug Log)

### 2. Full E2E Regression — `npm run test:e2e`
**29 / 29 suites PASS** — total time 285s

| Sprint | Suites | Result |
|---|---|---|
| Sprint 2 | Super Admin couple management | ✅ |
| Sprint 3 | Guest CRUD, RSVP, cleanup, data integrity | ✅ |
| Sprint 4 | Public invitation route, invitation smoke | ✅ |
| Sprint 5 | RSVP token, gallery, countdown, sprint QA | ✅ |
| Sprint 6 | Checklist, budget, agenda, planning tools QA | ✅ |
| Sprint 7 | Table creation, guest assignments, Find My Table, seating regression | ✅ |
| Sprint 8 | Vendor onboarding, approval, profile/listings, browse, lifecycle QA | ✅ |
| Sprint 9 | Billing smoke, plan entitlements, notifications | ✅ |
| Sprint 10 | Public site static QA | ✅ |

### 3. Database & Migrations
- [x] Prisma schema exists and migrations tested with SQLite locally
- [ ] **TODO (production)**: run `npx prisma migrate deploy` against Postgres + `npm run prisma:seed`

### 4. Authentication
- [x] NextAuth credentials provider tested — COUPLE, VENDOR, SUPER_ADMIN roles
- [x] Route protection middleware blocks unauthenticated + wrong-role access
- [x] JWT sessions include role; protected routes reject wrong-owner access

### 5. Billing
- [x] Stripe sandbox checkout, webhook persistence, and subscription state tested
- [x] Plan entitlements (trial/pro/premium) enforced via `/api/admin/plans/entitlements`
- [ ] **TODO (production)**: configure `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` in env

### 6. Notifications
- [x] Email invite generation tested (template rendered)
- [x] WhatsApp opt-in respected (blocked for opted-out guests)
- [ ] **TODO (production)**: configure real email provider (SMTP/SendGrid) and WhatsApp API keys

### 7. Open PRs (merge before release)
| PR | Branch | What |
|---|---|---|
| #10 | `codex/stabilize-build-lint` | Build + lint fixes |
| #11 | `codex/public-site-design-align` | Landing page CSS mockups |
| #12 | `codex/qa-smoke-browser` | E2E regression suite 29/29 |

---

## 🔲 Pre-Production Checklist (not yet done)

- [ ] Merge PRs #10, #11, #12 into `main`
- [ ] Set `DATABASE_URL` to production Postgres
- [ ] Run Prisma migrations on production DB
- [ ] Configure Stripe production keys + register webhooks
- [ ] Configure email provider credentials
- [ ] Set `NEXTAUTH_SECRET` to a strong random value
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Deploy to staging and run manual exploratory QA
- [ ] Run `npm run test:e2e` against staging URL (`BASE_URL=https://staging.wedplan.com`)
- [ ] Review Dependabot security alerts (20 open: 9 high, 9 moderate, 2 low)
- [ ] Resolve `no-explicit-any` lint debt (291 warnings — see Bug Log)

---

## Notes
- Local dev uses SQLite (`web-app/prisma/dev_sqlite.db`). Production requires Postgres.
- PowerShell execution policy may block `npm` scripts on Windows — use `node scripts/*.js` directly.
- Brand name is **WedPlan** everywhere (verify no "WedInvite" references remain in UI copy).
