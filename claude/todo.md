# Undone Tasks & Pending Work

## Sprint 7 — Table Assignments (BLOCKED: needs Sprint 6 complete)

### Task 7.2 — Guest-to-Table Assignment Flows
- Status: **NOT STARTED**
- Branch: `codex/couple-dashboard-align`
- Work: conflict checks, undo/reassign flow, bulk assignment, keyboard accessibility
- Acceptance: guests can be assigned and reassigned with conflicts prevented

### Task 7.3 — Guest "Find My Table" Experience
- Status: **NOT STARTED**
- Branch: `codex/invitation-flow-align`
- Work: privacy-gated lookup form, verification step, table result display
- Acceptance: guests can locate their table only after passing verification

### Task 7.4 — Sprint 7 QA
- Status: **NOT STARTED**
- Work: assignment smoke tests, capacity enforcement, privacy checks, print/export validation

---

## Sprint 8 — Vendor Portal

### Task 8.3 — Vendor Profile & Service Listing Management
- Status: **NOT STARTED**
- Branch: `codex/vendor-portal-complete`
- Work: profile editing, service listing forms, gallery images, pricing fields, SEO copy
- Acceptance: vendors can update profiles and service listings and changes persist

---

## Sprint 9 — Subscriptions, Payments & Polish

### Task 9.2 — Super Admin Plan & Subscription Management
- Status: **NOT STARTED**
- Branch: `codex/super-admin-full-control`
- Work: feature gating matrix, entitlements, billing state display, support notes
- Acceptance: admins can view and manage plan state with proper gating

### Task 9.3 — Email Notifications & WhatsApp Invite Integration
- Status: **NOT STARTED**
- Branch: `codex/couple-dashboard-align` or `codex/billing-pricing-entitlements`
- Work: email/WhatsApp templates, sending hooks, retry handling, opt-in rules
- Acceptance: notifications can be generated and sent from relevant trigger points

### Task 9.4 — End-to-End Testing, Bug Squashing & UI Polish
- Status: **NOT STARTED**
- Work: E2E test coverage, visual regression checks, bug log, release checklist
- Acceptance: critical user journeys pass E2E tests and UI issues are resolved

---

## Sprint 10 — Public Website

### Task 10.1 — Public Website Landing Page
- Status: **NOT STARTED**
- Branch: `codex/public-site-design-align`
- Reference: `Public Website/Public Website.png`
- Work: brand header, hero, CTA hierarchy, feature cards, how-it-works, templates, stats, testimonials, vendor logos, footer, newsletter
- Acceptance: landing page matches design and is responsive

---

## Infrastructure / Setup

### codex/stabilize-build-lint Branch
- Status: **BRANCH MISSING** — `codex/stabilize-build-lint` does not exist yet
- Run: `git worktree add -b codex/stabilize-build-lint "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-01-stabilize" dev`
- Work: fix build blockers, bad import paths, duplicate middleware, stale route bugs

### Postgres Migration (Production)
- Status: **PENDING** — only SQLite dev DB verified locally
- When ready:
  1. Set `DATABASE_URL` in `web-app/.env` to Postgres
  2. `npx prisma generate`
  3. `npx prisma migrate deploy`
  4. `npm run prisma:seed`

### Stale/Extra Branches to Review
These branches exist but are not in the official plan — review and close/merge or delete:
- `agents/commit-to-dev-branch`
- `agents/greeting-response-handler`
- `backup-before-undo`
- `codex/fix-pr-7-sentry-env`
- `pre-remove-zip`
- `subagent-Couple-Dashboard-Builder-portal-builder-828c0d39`
- `subagent-Invitation-Website-Builder-portal-builder-cfdc92cc`

---

## Spec Docs
- `superadmin.md` — exists at root ✅
- `vendorportal.md` — exists at root ✅
- `coupleadmin.md` — exists at root ✅
- `invitation.md` — exists at root ✅
