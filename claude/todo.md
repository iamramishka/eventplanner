# Undone Tasks & Pending Work

## ✅ Completed (verified with smoke tests)

| Task | Sprint | Evidence |
|---|---|---|
| Build stabilized — 0 errors, 42 routes | Infra | PR #10 open |
| Lint — 0 errors, 291 warnings documented | Infra | PR #10 open |
| Public landing page — CSS mockups replace broken images | Sprint 10 | PR #11 open |
| Task 7.2 — Guest-to-table assignment, undo, bulk, drag-drop | Sprint 7 | `test_task72_guest_table_assignments.js` ✅ |
| Task 7.3 — Guest "Find My Table" with privacy gating | Sprint 7 | `test_task73_find_table.js` ✅ |
| Task 7.4 — Sprint 7 seating-chart regression | Sprint 7 | `test_task74_seating_chart_regression.js` ✅ |
| Task 8.3 — Vendor profile & service listing management | Sprint 8 | `test_task83_vendor_profile_listings.js` ✅ (68/68) |
| Task 8.4 — Vendor browse & shortlist | Sprint 8 | `test_task84_vendor_browse_and_shortlist.js` ✅ |
| Task 8.5 — Sprint 8 QA full lifecycle | Sprint 8 | `test_task85_sprint8_qa.js` ✅ |
| Task 9.2 — Super Admin plan & entitlement management | Sprint 9 | `test_task92_plans.js` ✅ (11/11) |
| Task 9.3 — Email & WhatsApp notifications with opt-in | Sprint 9 | `test_task93_notifications.js` ✅ (7/7) |
| All stale branches deleted | Infra | local + remote |
| `dev` merged into `main`, `dev` deleted | Infra | done |

---

## ✅ All sprint tasks complete

### Task 9.4 — End-to-End Testing, Bug Squashing & UI Polish
- Status: **DONE** — PR #23 merged
- `scripts/test_task94_e2e_regression.js` — journey-level E2E suite (public routes, auth gating, couple/seating/vendor/admin/notification journeys)
- `scripts/e2e_regression_suite.js` — updated to include analytics + journey tests
- `npm run test:e2e` runs the full regression gate

### Task 10.1 — Public Website Landing Page
- Status: **DONE** — modern redesign merged in PR #17

---

## Open PRs

None.

---

## Infrastructure

### Postgres Migration (Production)
- Status: **PENDING** — only SQLite dev DB verified locally
- When ready:
  1. Set `DATABASE_URL` in `web-app/.env` to Postgres
  2. `npx prisma generate`
  3. `npx prisma migrate deploy`
  4. `npm run prisma:seed`

### Lint Debt (291 warnings)
- All `@typescript-eslint/no-explicit-any` — 200+ instances across AI-generated code
- All `@next/next/no-img-element` — `<img>` should be `<Image>` for LCP
- Owner: each lane agent should clean their own module files
- Tracked: `eslint.config.mjs` sets `no-explicit-any` to `warn` (not error)

---

## Spec Docs
- `superadmin.md` — exists at root ✅
- `vendorportal.md` — exists at root ✅
- `coupleadmin.md` — exists at root ✅
- `invitation.md` — exists at root ✅
