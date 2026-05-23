# Worktree, Skills, And Agent Execution Plan

## Analysis

`list.md` started as a high-level coordination document. This version makes it executable: it defines exact worktree paths, branch order, skills per lane, agent ownership, file boundaries, merge order, QA gates, and task prompts.

Current repo state expected before execution:

- Base branch: `dev`
- Production app: `web-app`
- Design/reference folders: `Couple Dashboard`, `Vendor Portal`, `Super Admin`, `invitation Page`, `Public Website`
- Worktree root: `C:\Users\ramis\Downloads\wed-plan-worktrees`
- Branch prefix: `codex/`

Important rule: each worktree owns only its assigned lane. Agents must not revert or overwrite work from other lanes. If a lane needs a shared file, it must document the reason in its final notes.

## Skills List

- GitHub Ethics: protect user work, avoid destructive commands, keep branches clear, never force reset without explicit request.
- Software Engineering Ethics: secure defaults, privacy for guest/vendor data, honest QA status, no fake production-ready claims.
- Error Fixing: build failures, bad imports, client/server component mistakes, stale routes, lint debt.
- API Handling: stable route contracts, validation, RBAC, ownership checks, consistent responses, structured errors.
- Database & Migration: Prisma/Postgres schema design, migrations, seeds, replacing in-memory stores.
- Feature Comparing: compare implementation against `plan.md`, `coupleadmin.md`, `vendorportal.md`, `superadmin.md`, `invitation.md`.
- Image Comparing: compare Browser screenshots against mockup folders and `rename_map.csv`.
- UI/UX Alignment: responsive layouts, design tokens, dashboard density, forms, accessibility, loading/empty/error states.
- Logo & Branding Placement: consolidate WedPlan/WedInvite, main logo, sidebar logo, public logo, auth logo, favicon.
- Super Admin Full Control: manage logo, contact numbers, prices/plans, public CMS, templates, settings, vendors, couples, logs.
- Flow Testing: public invite, RSVP, find table, register/login, couple dashboard, vendor portal, super admin.
- QA/Release: build, lint, smoke suite, Browser QA, production-like Postgres checks, release checklist.
- Billing/Pricing: Stripe config, sandbox parity, plan entitlements, editable prices, subscription state.
- Security Review: API auth, audit logs, secret handling, upload limits, unsafe public data exposure.

## Worktree Creation Commands

Run from `C:\Users\ramis\Downloads\wed plan` after this file is committed to `dev`.

```powershell
New-Item -ItemType Directory -Force -Path "C:\Users\ramis\Downloads\wed-plan-worktrees"

git worktree add -b codex/stabilize-build-lint "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-01-stabilize" dev
git worktree add -b codex/data-auth-rbac "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-02-data-auth" dev
git worktree add -b codex/design-system-branding "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-09-design-system" dev
git worktree add -b codex/super-admin-full-control "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-03-super-admin" dev
git worktree add -b codex/public-site-design-align "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-04-public-site" dev
git worktree add -b codex/couple-dashboard-align "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-05-couple-dashboard" dev
git worktree add -b codex/vendor-portal-complete "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-06-vendor-portal" dev
git worktree add -b codex/invitation-flow-align "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-07-invitation" dev
git worktree add -b codex/billing-pricing-entitlements "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-08-billing" dev
git worktree add -b codex/qa-smoke-browser "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-10-qa-automation" dev
git worktree add -b codex/security-privacy-audit "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-11-security-review" dev
git worktree add -b codex/docs-release-checklist "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-12-docs-release" dev
```

## Agent And Skill Assignments

| Worktree | Branch | Agent | Skills | Primary Responsibility | Do Not Touch Without Coordination | Exit Gate |
|---|---|---|---|---|---|---|
| `wed-plan-wt-01-stabilize` | `codex/stabilize-build-lint` | Build/Error Fix Agent | Error Fixing, API Handling, QA/Release, GitHub Ethics | Fix build blockers, bad import paths, metadata/client mistakes, duplicate `middleware.ts`/`proxy.ts`, stale route bugs, script port assumptions | Feature redesigns, Prisma model expansion, visual redesigns | `npm run build` passes; lint baseline is reduced or documented |
| `wed-plan-wt-02-data-auth` | `codex/data-auth-rbac` | Data/Auth Agent | Database & Migration, API Handling, Security Review | Move core demo/in-memory data toward Prisma-backed users, weddings, vendors, login/register persistence, API session checks | Public visual redesign, dashboard layout redesign | Protected APIs reject unauthenticated, wrong-role, and wrong-owner access |
| `wed-plan-wt-03-super-admin` | `codex/super-admin-full-control` | Super Admin Backend Agent | Super Admin Full Control, API Handling, Billing/Pricing, Security Review | Build full control for logo, contact numbers, prices/plans, public CMS, templates, settings, audits | Low-level auth primitives unless needed via Data/Auth lane | Admin edits persist and appear in relevant public/admin UI |
| `wed-plan-wt-04-public-site` | `codex/public-site-design-align` | Public Site UI Agent | UI/UX Alignment, Image Comparing, Logo Placement | Align landing, login, signup step 1/2, find-event, and asset placement to `Public Website` designs | Auth database logic, billing internals | Desktop/mobile screenshots match public/auth references |
| `wed-plan-wt-05-couple-dashboard` | `codex/couple-dashboard-align` | Couple Dashboard Agent | Feature Comparing, UI/UX Alignment, Flow Testing | Add missing couple modules and polish: vendors, music, account/subscription, notifications, advanced seating | Vendor portal internals, Super Admin CMS | No core couple module is marked "Soon" without documented reason |
| `wed-plan-wt-06-vendor-portal` | `codex/vendor-portal-complete` | Vendor Portal Agent | Feature Comparing, API Handling, UI/UX Alignment | Replace bookings, availability, messages, analytics, payouts, settings placeholders with working flows | Couple dashboard and public landing layouts | Placeholder vendor modules are replaced with usable states |
| `wed-plan-wt-07-invitation` | `codex/invitation-flow-align` | Invitation Flow Agent | Flow Testing, Security Review, UI/UX Alignment | Consolidate `/:slug` and `/invitation/:slug`, fix RSVP token flow, table finder, guest privacy | Public marketing page redesign | One canonical invitation flow passes guest scenarios |
| `wed-plan-wt-08-billing` | `codex/billing-pricing-entitlements` | Billing Agent | Billing/Pricing, API Handling, QA/Release | Connect editable plans, Stripe/sandbox parity, subscription state, entitlement enforcement | Public visual design and unrelated auth refactors | Plan changes affect checkout and feature limits |
| `wed-plan-wt-09-design-system` | `codex/design-system-branding` | Design System Agent | Logo Placement, UI/UX Alignment, Image Comparing | Consolidate WedPlan/WedInvite, tokens, shared brand rules, logo placement across surfaces | Business logic and migrations | Brand is consistent across public/admin/vendor/couple |
| `wed-plan-wt-10-qa-automation` | `codex/qa-smoke-browser` | QA Automation Agent | QA/Release, Flow Testing, Image Comparing | Stabilize smoke runner, explicit ports, Browser QA, regression reporting | Feature implementation except QA harnesses | One repeatable QA command produces clear pass/fail output |
| `wed-plan-wt-11-security-review` | `codex/security-privacy-audit` | Security/Ethics Reviewer | Security Review, Software Engineering Ethics, GitHub Ethics | Review auth bypasses, unsafe data exposure, upload/privacy/logging risks | Large feature rewrites unless fixing security defect | Security findings fixed or logged with severity |
| `wed-plan-wt-12-docs-release` | `codex/docs-release-checklist` | GitHub Release Agent | GitHub Ethics, QA/Release, Feature Comparing | Final docs, release checklist, setup docs, QA evidence, merge notes | Product code except documentation links/references | Docs match actual app status and test evidence |

## Dependency And Merge Order

1. Merge `codex/stabilize-build-lint` first.
2. Merge `codex/design-system-branding` second, because UI lanes depend on brand/tokens.
3. Merge `codex/data-auth-rbac` before Super Admin, Vendor, Couple, and Billing.
4. Merge feature lanes after stabilization, design system, and data/auth:
   - `codex/super-admin-full-control`
   - `codex/public-site-design-align`
   - `codex/couple-dashboard-align`
   - `codex/vendor-portal-complete`
   - `codex/invitation-flow-align`
   - `codex/billing-pricing-entitlements`
5. Merge `codex/qa-smoke-browser` after feature lanes.
6. Merge `codex/security-privacy-audit` after QA exposes final flows.
7. Merge `codex/docs-release-checklist` last.

## Agent Task Prompts

### Build/Error Fix Agent

You own `wed-plan-wt-01-stabilize` on `codex/stabilize-build-lint`. Fix build blockers and routing/import errors without feature redesign. Verify `npm run build`; run `npm run lint` and document remaining lint debt if full cleanup is too broad. Focus on broken imports, Next 16 client/server component rules, duplicate middleware/proxy behavior, bad route links, and stale smoke script ports.

### Data/Auth Agent

You own `wed-plan-wt-02-data-auth` on `codex/data-auth-rbac`. Replace critical in-memory/demo auth and registration paths with Prisma-backed persistence. Add role/ownership checks to protected APIs. Keep UI changes minimal. Verify COUPLE, VENDOR, SUPER_ADMIN, unauthenticated, and wrong-owner cases.

### Super Admin Backend Agent

You own `wed-plan-wt-03-super-admin` on `codex/super-admin-full-control`. Build persistent Super Admin controls for platform branding, logo, contact numbers, plans/prices, public CMS blocks, templates, settings, logs, and audit history. Admin changes must persist and be visible in the relevant public/admin UI.

### Public Site UI Agent

You own `wed-plan-wt-04-public-site` on `codex/public-site-design-align`. Align public landing, login, signup step 1, signup step 2, and find-event pages to the `Public Website` mockups. Use existing app conventions, correct asset serving, responsive desktop/mobile layouts, and accessible form states.

### Couple Dashboard Agent

You own `wed-plan-wt-05-couple-dashboard` on `codex/couple-dashboard-align`. Compare against `coupleadmin.md` and `Couple Dashboard` assets. Add missing couple dashboard capabilities for vendors, music, account/subscription, notifications, and advanced seating polish while preserving existing working modules.

### Vendor Portal Agent

You own `wed-plan-wt-06-vendor-portal` on `codex/vendor-portal-complete`. Replace placeholder vendor portal modules with working bookings, availability, messages, analytics, payouts, and settings flows. Preserve existing profile/listing functionality.

### Invitation Flow Agent

You own `wed-plan-wt-07-invitation` on `codex/invitation-flow-align`. Consolidate duplicate invitation routes, fix RSVP token behavior, fix table finder flow, and reduce guest data exposure. Align loading/envelope/guest-facing sections with `invitation.md` and `invitation Page` references.

### Billing Agent

You own `wed-plan-wt-08-billing` on `codex/billing-pricing-entitlements`. Connect editable plans/prices, Stripe and sandbox parity, subscription state, and entitlement enforcement. Coordinate with Data/Auth and Super Admin if shared schema/API changes are required.

### Design System Agent

You own `wed-plan-wt-09-design-system` on `codex/design-system-branding`. Consolidate WedPlan/WedInvite branding, shared tokens, logo placement, favicon, admin palette decisions, and cross-surface visual rules. Avoid feature logic changes.

### QA Automation Agent

You own `wed-plan-wt-10-qa-automation` on `codex/qa-smoke-browser`. Create a reliable QA harness with explicit ports, stable smoke runner, Browser screenshots, and regression reporting for public, auth, couple, vendor, super admin, billing, RSVP, and invitation flows.

### Security/Ethics Reviewer

You own `wed-plan-wt-11-security-review` on `codex/security-privacy-audit`. Review API auth, owner boundaries, guest privacy, upload handling, audit logs, secrets, and destructive admin actions. Fix narrow security issues or log findings with severity and reproduction steps.

### GitHub Release Agent

You own `wed-plan-wt-12-docs-release` on `codex/docs-release-checklist`. Update docs only after implementation and QA evidence exists. Maintain release checklist, setup notes, worktree summary, known issues, and merge notes.

## QA Gates

- Stabilization gate: `npm run build` passes from `web-app`.
- Lint gate: `npm run lint` either passes or has a documented, reduced baseline with owners.
- Data/auth gate: protected APIs reject unauthenticated, wrong-role, and wrong-owner requests.
- UI gate: Browser desktop/mobile screenshots are captured for public, login, signup, invitation, couple, vendor, and super admin pages.
- Flow gate: smoke tests cover invitation, RSVP, table finder, guests, budget, checklist, agenda, vendor onboarding/listings, billing, and Super Admin controls.
- Security gate: no known high-severity auth/privacy issue remains untracked.
- Release gate: docs and release checklist reflect actual test results, not assumptions.

## Assumptions

- `web-app` is the production app.
- Root design folders are references and should not be renamed during feature work.
- `dev` remains the base branch.
- Worktrees live outside the repo under `C:\Users\ramis\Downloads\wed-plan-worktrees`.
- Default brand is `WedPlan` unless the owner supplies a different logo/name later.
