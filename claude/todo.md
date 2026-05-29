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

## 🔲 Remaining Work

### Task 9.4 — End-to-End Testing, Bug Squashing & UI Polish
- Status: **NOT STARTED**
- Branch: `codex/qa-smoke-browser`
- Work: full E2E test coverage across all journeys, visual regression, bug log, release checklist
- Acceptance: critical user journeys pass E2E and UI issues are resolved

### Task 10.1 — Public Website Landing Page (full design match)
- Status: **PR #11 OPEN** — broken images fixed with CSS mockups
- Remaining: real hero screenshot when app is deployed; template thumbnails from actual designs
- Branch: `codex/public-site-design-align`

---

## Open PRs (pending merge)

| PR | Branch | What |
|---|---|---|
| #10 | `codex/stabilize-build-lint` | Build + lint fixes |
| #11 | `codex/public-site-design-align` | Landing page broken image fix |

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
