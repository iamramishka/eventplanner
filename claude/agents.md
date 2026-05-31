# Agent Assignments

Each agent owns one worktree lane. Agents must not revert or overwrite work from other lanes.

## Summary Table

| # | Worktree | Branch | Agent | Primary Responsibility | Exit Gate |
|---|---|---|---|---|---|
| 01 | `wed-plan-wt-01-stabilize` | `codex/stabilize-build-lint` | Build/Error Fix | Fix build blockers, import errors, routing bugs | `npm run build` passes |
| 02 | `wed-plan-wt-02-data-auth` | `codex/data-auth-rbac` | Data/Auth | Prisma-backed auth, RBAC, ownership checks | Protected APIs reject wrong-role & wrong-owner |
| 03 | `wed-plan-wt-03-super-admin` | `codex/super-admin-full-control` | Super Admin Backend | Logo, prices, CMS, templates, audit | Admin edits persist and appear in UI |
| 04 | `wed-plan-wt-04-public-site` | `codex/public-site-design-align` | Public Site UI | Align landing, login, signup, find-event to mockups | Desktop/mobile screenshots match references |
| 05 | `wed-plan-wt-05-couple-dashboard` | `codex/couple-dashboard-align` | Couple Dashboard | Add missing modules: vendors, music, notifications, seating | No module marked "Soon" without reason |
| 06 | `wed-plan-wt-06-vendor-portal` | `codex/vendor-portal-complete` | Vendor Portal | Replace placeholder modules with working flows | All placeholders replaced with usable states |
| 07 | `wed-plan-wt-07-invitation` | `codex/invitation-flow-align` | Invitation Flow | Consolidate routes, fix RSVP, table finder, guest privacy | One canonical invitation flow passes guest scenarios |
| 08 | `wed-plan-wt-08-billing` | `codex/billing-pricing-entitlements` | Billing | Stripe/sandbox, editable plans, entitlement enforcement | Plan changes affect checkout and feature limits |
| 09 | `wed-plan-wt-09-design-system` | `codex/design-system-branding` | Design System | WedPlan brand, tokens, logo placement, cross-surface rules | Brand consistent across all surfaces |
| 10 | `wed-plan-wt-10-qa-automation` | `codex/qa-smoke-browser` | QA Automation | Stable smoke runner, browser QA, regression reporting | One repeatable QA command with clear pass/fail |
| 11 | `wed-plan-wt-11-security-review` | `codex/security-privacy-audit` | Security Reviewer | Auth bypasses, data exposure, upload/privacy/logging risks | Findings fixed or logged with severity |
| 12 | `wed-plan-wt-12-docs-release` | `codex/docs-release-checklist` | GitHub Release | Docs, release checklist, QA evidence, merge notes | Docs match actual app status |

---

## Agent Prompts

### 01 — Build/Error Fix Agent
You own `wed-plan-wt-01-stabilize` on `codex/stabilize-build-lint`. Fix build blockers and routing/import errors without feature redesign. Run `npm run build` from `web-app/`. Fix broken imports, Next.js client/server component rules, duplicate middleware/proxy behavior, bad route links, and stale smoke script ports. Run `npm run lint` and document remaining lint debt if full cleanup is too broad. **Do not** redesign features or expand the Prisma model.

### 02 — Data/Auth Agent
You own `wed-plan-wt-02-data-auth` on `codex/data-auth-rbac`. Replace critical in-memory/demo auth and registration with Prisma-backed persistence. Add role/ownership checks to protected APIs. Keep UI changes minimal. Verify COUPLE, VENDOR, SUPER_ADMIN, unauthenticated, and wrong-owner access cases. **Do not** redesign public visual UI or dashboard layouts.

### 03 — Super Admin Backend Agent
You own `wed-plan-wt-03-super-admin` on `codex/super-admin-full-control`. Build persistent Super Admin controls for platform branding, logo, contact numbers, plans/prices, public CMS blocks, templates, settings, logs, and audit history. Admin changes must persist and be visible in the relevant public/admin UI. **Do not** touch low-level auth primitives unless needed.

### 04 — Public Site UI Agent
You own `wed-plan-wt-04-public-site` on `codex/public-site-design-align`. Align public landing, login, signup step 1, signup step 2, and find-event pages to the `Public Website` mockups. Use existing app conventions, correct asset serving, responsive desktop/mobile layouts, and accessible form states. **Do not** touch auth database logic or billing internals.

### 05 — Couple Dashboard Agent
You own `wed-plan-wt-05-couple-dashboard` on `codex/couple-dashboard-align`. Compare against `coupleadmin.md` and `Couple Dashboard/` assets. Add missing capabilities for vendors, music, account/subscription, notifications, and advanced seating polish. Preserve all existing working modules. **Do not** touch vendor portal internals or Super Admin CMS.

### 06 — Vendor Portal Agent
You own `wed-plan-wt-06-vendor-portal` on `codex/vendor-portal-complete`. Replace placeholder vendor portal modules with working bookings, availability, messages, analytics, payouts, and settings flows. Reference `Vendor Portal/` mockups. Preserve existing profile/listing functionality. **Do not** touch couple dashboard or public landing layouts.

### 07 — Invitation Flow Agent
You own `wed-plan-wt-07-invitation` on `codex/invitation-flow-align`. Consolidate duplicate invitation routes (`/[slug]` and `/invitation/[slug]`), fix RSVP token behavior, fix table finder flow, and reduce guest data exposure. Align with `invitation.md` and `invitation Page/` references. **Do not** redesign public marketing page.

### 08 — Billing Agent
You own `wed-plan-wt-08-billing` on `codex/billing-pricing-entitlements`. Connect editable plans/prices, Stripe sandbox parity, subscription state, and entitlement enforcement. Coordinate with Data/Auth and Super Admin if shared schema/API changes are needed. **Do not** touch public visual design or unrelated auth refactors.

### 09 — Design System Agent
You own `wed-plan-wt-09-design-system` on `codex/design-system-branding`. Consolidate WedPlan/WedInvite branding, shared design tokens, logo placement, favicon, admin palette, and cross-surface visual rules. **Do not** touch business logic or database migrations.

### 10 — QA Automation Agent
You own `wed-plan-wt-10-qa-automation` on `codex/qa-smoke-browser`. Create a reliable QA harness with explicit ports, stable smoke runner, browser screenshots, and regression reporting for all surfaces: public, auth, couple, vendor, super admin, billing, RSVP, and invitation. **Do not** implement features beyond QA harnesses.

### 11 — Security/Ethics Reviewer
You own `wed-plan-wt-11-security-review` on `codex/security-privacy-audit`. Review API auth, owner boundaries, guest privacy, upload handling, audit logs, secrets, and destructive admin actions. Fix narrow security issues or log findings with severity and reproduction steps. **Do not** perform large feature rewrites unless fixing a security defect.

### 12 — GitHub Release Agent
You own `wed-plan-wt-12-docs-release` on `codex/docs-release-checklist`. Update docs only after implementation and QA evidence exists. Maintain release checklist, setup notes, worktree summary, known issues, and merge notes. **Do not** modify product code except documentation links and references.
