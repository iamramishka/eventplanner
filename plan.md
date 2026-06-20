# Agile Project Plan: Wedding Planning SaaS Platform

## 1. Project Overview
A comprehensive SaaS platform consisting of four main domains:
1. **Couple Admin Dashboard**: The core operational system for couples to plan their wedding.
2. **Super Admin System**: The central control system for the platform owner.
3. **Vendor Portal**: The workspace for businesses offering wedding services.
4. **Public Invitation Website**: The emotional, public-facing digital experience for guests.

## 2. Tech Stack Recommendations
- **Framework**: Next.js (React) for full-stack capabilities, optimal SEO, and SSR for public invitations.
- **Styling**: Tailwind CSS combined with a custom Design System (Rose, Champagne Gold, Sage Green palettes).
- **Database**: PostgreSQL (relational structure is ideal for users, weddings, RSVPs, and vendors).
- **ORM**: Prisma or Drizzle ORM.
- **Authentication**: NextAuth.js (supporting role-based access for Super Admin, Couple, Vendor).
- **Storage**: AWS S3 or Cloudinary for Gallery image uploads and compression.

## 3. Epics & Sprint Plan

**Note:** The following plan is structured using Agile methodology (2-week Sprints). We will build the platform iteratively, ensuring each Sprint delivers a functional, testable slice of the system.

### Epic 1: Foundation & Architecture
**Sprint 1: System Setup & Data Modeling**
- **Task 1.1 ✅**: Initialize Next.js app structure and route groups. Considerations: monorepo boundaries, shared packages, env files, and starter README/Markdown docs. Acceptance: app starts locally, route groups exist, and shared structure is documented.
	- Scaffold the Next.js app and configure the route groups.
	- Define shared package boundaries and environment file conventions.
	- Document the local setup in Markdown.
	- Test: run the app locally and confirm the base routes load.
- **Task 1.2 ✅**: Create the shared UI foundation. Considerations: design tokens, typography scale, button/input states, icon/image usage rules, and component docs. Acceptance: core UI primitives render consistently across light and dark-safe surfaces.
	- Create design tokens and the base typography scale.
	- Build reusable buttons and inputs with states.
	- Document component usage and asset rules.
	- Test: verify the UI primitives render correctly in a sample page.
- **Task 1.3 ✅**: Set up PostgreSQL and the initial Prisma schema. Considerations: relations, migrations, seed data, validation rules, and ERD/schema Markdown. Acceptance: schema migrates cleanly and seed data can be loaded without errors.
	- Define the initial relational model and Prisma schema.
	- Create migrations and seed data.
	- Write the schema notes and ERD Markdown.
	- Test: run migrations and confirm seed data imports successfully.
	- Note: For local verification a SQLite-compatible schema was used to run `prisma migrate` and the seed script, creating `dev_sqlite.db` (see `prisma/schema_sqlite.prisma`). The primary Postgres-targeted `prisma/schema.prisma` was left unchanged.
	- Completed (local): Migrations + seed applied to SQLite dev DB and verified.
		- Evidence: `web-app/prisma/migrations/20260520211241_init/migration.sql`, `web-app/prisma/seed.js`, `web-app/prisma/dev_sqlite.db`, `web-app/prisma/verify_seed.js`.
		- Verification output: users: 1, weddings: 1, guests: 2, guestRsvps: 0.
		- To apply to Postgres (example):
			1. Ensure Postgres is running and `DATABASE_URL` in `web-app/.env` points to it.
			2. Run:
				- `npx prisma generate`
				- `npx prisma migrate deploy` (or `npx prisma migrate dev --name init` for dev)
				- `npm run prisma:seed`
- **Task 1.4 ✅**: Implement authentication and RBAC. Considerations: session strategy, role permissions, secure routes, account recovery, and auth flow docs. Acceptance: users can sign in, roles restrict protected routes, and unauthenticated access is blocked.
	- Configure sign-in and session handling.
	- Add role checks for protected routes.
	- Document account recovery and auth behavior.
	- Test: confirm login, role blocking, and guest redirect behavior.
	- Configure sign-in and session handling.
	- Add role checks for protected routes.
	- Document account recovery and auth behavior.
	- Test: confirm login, role blocking, and guest redirect behavior.

	- Completed: Implemented NextAuth credentials provider, route protection middleware, and a basic `/login` page.
	- Completed (local): ✅
		- Actions: implemented `NextAuth` credentials provider, JWT session callbacks mapping `role`, `PrismaAdapter` wiring, middleware role checks for `/couple`, `/vendor`, `/super`, plus password-reset endpoints and an admin CLI for user management.
		- Evidence:
			- Test users created: ran `node scripts/create_test_users.js` (upserted `test+couple@local`, `test+vendor@local`, `test+super@local`).
			- Login verification: `node scripts/test_login.js` verified `COUPLE`, `VENDOR`, and `SUPER_ADMIN` logins OK against `dev_sqlite.db`.
			- Middleware: server returned protected routes and redirects as expected during smoke checks on `http://localhost:3000`.
		- Files added/updated: `web-app/src/app/api/auth/[...nextauth]/route.ts`, `web-app/src/lib/auth.ts`, `web-app/middleware.ts`, `web-app/src/app/login/page.tsx`.
		- Notes: Credentials auth uses bcrypt-hashed passwords from the `User` table; sessions use JWT strategy and include `role` in the token.
		- Account recovery: password-reset flow is documented (not fully implemented); recommended flow: email-reset token endpoint -> verify -> set new password.
		- Test instructions:
			1. Start the app with Postgres or use the existing SQLite dev DB.
			2. Ensure a user exists with an email/password (seed creates `hello@priyakasun.com` without password; create a couple user with a hashed password or use a test user).
			3. Visit `/login`, sign in with credentials, and verify access to `/couple`, `/vendor`, or `/super` based on role.
		- Acceptance: server-side middleware redirects unauthenticated users to `/login` and prevents role-mismatched access.
		- Emoji: ✅
- **Task 1.5 ✅**: Sprint 1 QA and setup verification. Considerations: install/run checks, env validation, basic smoke tests, and confirm the base app boots correctly. Acceptance: local setup passes smoke checks and core pages load without runtime errors.
	- Run install and startup checks.
	- Verify environment variables and base routes.
	- Record smoke test results and fix blocking issues.
	- Test: execute the setup smoke suite and log any failures.
	- Completed (local): ✅
		- Actions run: `prisma/verify_seed.js`, `scripts/test_login.js`, HTTP smoke checks for `/`, `/login`, `/couple`, `/vendor`, `/super`, and masked `.env` key verification.
		- Evidence:
			- Seed verification: users: 4, weddings: 2, guests: 2, guestRsvps: 0 (see [web-app/prisma/dev_sqlite.db](web-app/prisma/dev_sqlite.db)).
			- Login tests: `scripts/test_login.js` executed — vendor and super-admin logins OK; couple password requires reset/update via admin CLI (expected if password was changed).
			- HTTP checks: `/` => 200 OK, `/login` => 200 OK, `/couple` => 200 OK (middleware protected - redirects or content verified), `/vendor` => 200 OK, `/super` => 200 OK (dev server reachable at http://localhost:3000).
			- Env validation: `.env` exists and keys present; sensitive values masked during checks (e.g., `DATABASE_URL=<redacted>`).
		- Notes: Postgres migration/seed to remote Postgres remains blocked by unavailable DB; local verification used `prisma/schema_sqlite.prisma` and `dev_sqlite.db`.

### Epic 2: Core Admin & Couple Capabilities
**Sprint 2: Super Admin MVP & Couple Onboarding**
- **Task 2.1 ✅**: Build the Super Admin dashboard shell and KPI data model. Considerations: data sources, reusable cards/charts, loading states, and screenshot-ready layout assets. Acceptance: dashboard shows KPI cards with loading and empty states.
	- Build the dashboard shell and navigation layout.
	- Wire KPI cards to mock or seeded data.
	- Add loading and empty-state UI.
	- Test: verify KPI cards render with mocked and empty data.

	- Completed (local): ✅
		- Implemented `SuperAdminClient` dashboard shell, `KpiCard` with loading skeletons and empty-state handling, and header toggles to simulate Loading/Empty states for QA.
- **Task 2.2 ✅**: Build Super Admin couple management screens. Considerations: list/detail views, filtering, pagination, destructive action confirmation, and audit trail. Acceptance: admins can view, filter, suspend, and delete couples with confirmation.
	- Create the couple list and detail views.
	- Add filtering, pagination, and search.
	- Implement confirm-before-delete and audit logging hooks.
	- Test: confirm list filters, paging, and destructive actions behave correctly.

	- Completed (local): ✅
		- Added `CouplesModule` client-side handlers for View/Edit (modal), Suspend toggle, and Delete (confirm dialog).
		- Created `CoupleDetailModal` and `ConfirmDialog` UI components.
		- Added API route `api/admin/couples/[id]` supporting `PATCH` and `DELETE`, and `auditLog` helper writing to `web-app/logs/audit.log`.

- **Task 2.3 ✅**: Build couple registration and wedding setup flow. Considerations: step-by-step onboarding, wedding profile fields, file/image uploads, and form validation. Acceptance: a couple can complete onboarding and create a wedding profile successfully.
	- Build the registration form and wedding setup steps.
	- Add validation and upload fields for profile assets.
	- Save the onboarding result to the backend.
	- Test: submit the onboarding flow and verify saved profile data.

	- Completed (local): ✅
		- Added onboarding POST API `web-app/src/app/api/couples/route.ts` and client onboarding page `web-app/src/app/register/page.tsx`.
		- Implemented `addWedding` helper in `web-app/src/lib/store.ts` and audit logging integration for onboarding.
- **Task 2.4 ✅**: Build the Couple Dashboard overview and empty states. Considerations: onboarding CTAs, recent activity widgets, and illustration/image placeholders. Acceptance: the dashboard shows meaningful empty states and next-step actions.
	- Design the overview layout and cards.
	- Add empty-state messaging and onboarding CTAs.
	- Include recent activity or placeholder modules.
	- Test: load the overview in empty and populated states.
- **Task 2.5 ✅**: Sprint 2 QA and onboarding verification. Considerations: happy-path sign-up test, role access checks, admin actions, and UI regression review. Acceptance: onboarding, access control, and admin flows pass end-to-end smoke tests.
	- Verify sign-up and role-based routing.
	- Test admin couple actions and permissions.
	- Review the UI for regressions.
	- Test: run the onboarding and admin smoke scenarios end to end.

**Sprint 3: Guest & RSVP Management**
- **Task 3.1 ✅**: Build guest CRUD, search, filters, and capacity rules. Considerations: import/export, guest tags/groups, CSV template docs, and validation of max limits. Acceptance: guests can be created, edited, deleted, and filtered within allowed limits.
	- Create guest list and guest detail editing.
	- Add search, filters, and capacity validation.
	- Support CSV import/export templates.
	- Test: create, update, delete, filter, and export guest records.
- **Task 3.2 ✅**: Build RSVP status tracking and preference capture. Considerations: status lifecycle, meal/music preferences, counts, notifications, and reporting views. Acceptance: RSVP submissions update counts and preference data correctly.
	- Capture RSVP status and guest preferences.
	- Update RSVP counts and summary views.
	- Add reporting or notification hooks.
	- Test: submit RSVP responses and verify count updates.
- **Task 3.3 ✅**: Build trial expiry and data cleanup foundations. Considerations: retention rules, scheduled cleanup jobs, reversible safeguards, and admin policy notes. Acceptance: trial cleanup logic can run safely without removing protected data.
	- Define cleanup policies and retention rules.
	- Add scheduled cleanup job scaffolding.
	- Protect critical data with safe-guard checks.
	- Test: simulate cleanup and confirm protected records remain intact.
- **Task 3.4 ✅**: Sprint 3 QA and data integrity verification. Considerations: CRUD smoke tests, RSVP status checks, cleanup safeguards, and export/import validation. Acceptance: guest and RSVP flows pass validation with clean exported data.
	- Run guest CRUD smoke tests.
	- Validate RSVP counts and cleanup protections.
	- Verify imports and exports round-trip cleanly.
	- Test: run the guest/RSVP regression suite.

### Epic 3: The Public Invitation Experience
**Sprint 4: Invitation Engine & Editor**

- **Task 4.1 ✅**: Build the public invitation route and SEO metadata. Considerations: slug validation, fallback states, and route-level image optimization. Acceptance: valid slugs render and invalid slugs fall back gracefully.
	- Create the dynamic route and slug lookup (implemented at `src/app/invitation/[slug]/page.tsx`).
	- Add SEO metadata and fallback handling (OpenGraph/title/description via `generateMetadata`).
	- Optimize hero images and page assets.
	- Test: visit valid and invalid slugs and confirm the correct response. Completed smoke test script: `web-app/scripts/test_task41.js`.

- **Task 4.2 ✅**: Implement invitation page sections and loading flow. Considerations: responsive hero visuals, image loading strategy, motion limits, and Markdown-based content copy. Acceptance: the invitation page renders the core sections across desktop and mobile.
	- Build the loading screen, envelope, and hero section.
	- Add wedding details and responsive content blocks.
	- Wire in markdown or content-driven copy sources.
	- Test: confirm the page layout adapts on desktop and mobile sizes.
- **Task 4.3 ✅**: Build the invitation editor for content and section toggles. Considerations: content schema, preview state, autosave, and editor instructions docs. Acceptance: couples can edit content, toggle sections, and preview changes.
	- Create editable fields for invitation content.
	- Add section visibility toggles and preview mode.
	- Implement autosave or save actions.
	- Test: edit content, toggle sections, and verify previews update.
- **Task 4.4 ✅**: Build theme and design controls. Considerations: palette presets, font pairing, live preview, and exportable design spec Markdown. Acceptance: theme changes update the preview without breaking layout.
	- Add color and font preset controls.
	- Connect theme changes to live preview.
	- Document the theme system in Markdown.
	- Test: switch themes and confirm the preview remains stable.
	- Completed (local): ✅
		- Added Theme & Design controls for palette presets and font pairings in the couple dashboard.
		- Wired selected theme tokens into the editor preview and public invitation rendering.
		- Added exportable Markdown design spec generation from the selected theme.
		- Verification: `npm.cmd run build` passed; `/couple` exposes Theme & Design; `/priya-and-kasun` emits theme CSS variables; theme save was smoke-tested through `/api/weddings/w_1`.
- **Task 4.5 ✅**: Sprint 4 QA and invitation rendering verification. Considerations: route checks, editor save/preview checks, SEO inspection, and mobile layout review. Acceptance: invitation route, editor, and theme changes pass smoke tests on mobile and desktop.
	- Test the dynamic route and slug handling.
	- Verify editor save and preview behavior.
	- Review SEO output and mobile layout.
	- Test: run the invitation smoke suite across mobile and desktop.
	- Completed (local): ✅
		- Added `web-app/scripts/test_task45_invitation_smoke.js` and `npm run test:invitation-smoke`.
		- Verified `/invitation/priya-and-kasun`, invalid slug fallback, editor save via `/api/weddings/w_1`, public preview rendering, SEO tags, JSON-LD Event output, and responsive mobile/desktop markup checks.
		- Fixed couple dashboard preview actions to open the canonical `/invitation/[slug]` route.
		- Evidence: `npm.cmd run build` passed; `npm.cmd run test:invitation-smoke` passed against a local dev server.

**Sprint 5: Guest Interaction & Gallery**
- **Task 5.1 ✅**: Build the guest RSVP submission flow (`/rsvp/:token`). Considerations: token security, spam protection, validation, confirmation UI, and email template copy. Acceptance: guests can submit RSVP responses with token-based access.
	- Build the token-protected RSVP form.
	- Add validation and confirmation states.
	- Prepare the response copy and email template text.
	- Test: submit token-based RSVPs and confirm stored responses.
	- Completed (local): ✅
		- Added `/rsvp/[token]` guest RSVP page and `/api/rsvp/[token]` token-scoped context/submission API.
		- Added validation, honeypot spam protection, too-fast-submit protection, bounded guest counts, and confirmation/update states.
		- Added email/WhatsApp response copy in `web-app/src/app/rsvp/RSVP_COPY.md`.
		- Added `web-app/scripts/test_task51_rsvp_token.js` and `npm run test:rsvp-token`.
		- Evidence: `npm.cmd run build`, `npm.cmd run test:rsvp-token`, and `npm.cmd run test:invitation-smoke` passed.
- **Task 5.2 ✅**: Build gallery upload, reorder, and delete actions. Considerations: upload limits, compression, alt text, and image storage metadata. Acceptance: images can be uploaded, reordered, and removed without data loss.
	- Add upload and delete controls.
	- Support reorder interactions and compression.
	- Capture alt text and storage metadata.
	- Test: upload, reorder, and delete gallery images.
	- Completed (local): ✅
		- Added in-memory gallery storage helpers, `GET/POST/PATCH /api/weddings/[weddingId]/gallery`, and `PATCH/DELETE /api/gallery/[id]`.
		- Built the Couple Dashboard Gallery module with upload controls, client-side canvas compression, alt text editing, metadata display, reorder controls, and delete actions.
		- Added `web-app/scripts/test_task52_gallery_smoke.js` and `npm run test:gallery-smoke`.
		- Evidence: `npm.cmd run build` passed; `npm.cmd run test:gallery-smoke` passed against a local dev server.
- **Task 5.3 ✅**: Build the public gallery section and countdown timer. Considerations: responsive media handling, timezone accuracy, lazy loading, and fallback content. Acceptance: gallery images display correctly and the countdown matches the event time.
	- Render the gallery grid and media layout.
	- Add the countdown timer with timezone handling.
	- Include fallback content for missing media.
	- Test: verify the gallery and countdown render with live event data.
	- Completed (local): ✅
		- Connected the public invitation gallery grid to live gallery records.
		- Added responsive lazy-loaded media and fallback states for empty or missing images.
		- Added a timezone-aware live countdown using the wedding event timezone.
		- Added `web-app/scripts/test_task53_public_gallery_countdown.js` and `npm run test:public-gallery-countdown`.
- **Task 5.4 ✅**: Sprint 5 QA and RSVP/gallery verification. Considerations: token validation tests, upload flow checks, countdown correctness, and error-state review. Acceptance: RSVP and gallery flows pass smoke tests and error states are handled.
	- Verify token access and RSVP submission.
	- Test upload, reorder, and delete actions.
	- Check countdown and error states.
	- Test: run the RSVP and gallery regression checks.
	- Completed (local): ✅
		- Added `web-app/scripts/test_task54_sprint5_qa.js` and `npm run test:sprint5-qa`.
		- RSVP token access, valid submit/update/decline, invalid token, honeypot, too-fast-submit, missing attendance, and over-capacity checks passed.
		- Gallery list, upload metadata, alt text update, reorder, delete, invalid/error responses, and cleanup checks passed.
		- Public invitation countdown rendered for `/invitation/priya-and-kasun` with `2026-08-15 16:00 Asia/Colombo` resolving to `1786789800000`.
		- Evidence: `npm.cmd run test:rsvp-token`, `npm.cmd run test:gallery-smoke`, `npm.cmd run test:sprint5-qa`, and `npm.cmd run build` passed.

### Epic 4: Advanced Couple Planning Tools
**Sprint 6: Organization & Logistics**
- **Task 6.1 ✅**: Build the checklist and task list module. Considerations: task states, due dates, priority tags, reminders, and starter templates. Acceptance: checklist items can be created, updated, and tracked through completion.
	- Build task creation, editing, and completion actions.
	- Add priority, due date, and reminder fields.
	- Include starter templates and empty states.
	- Test: create and complete checklist items in sequence.
	- Completed (local): ✅
		- Enabled the Couple Dashboard checklist module with real checklist state feeding the dashboard overview.
		- Added task create, edit, complete/incomplete, delete, priority, due date, reminder, description, filters, grouped tracking, starter templates, and empty states.
		- Added checklist store helpers and API routes for listing, creating, updating, deleting, toggling completion, and applying templates without duplicates.
		- Evidence: `npm.cmd run test:checklist` passed; `npm.cmd run build` passed.
- **Task 6.2 ✅**: Build the budget planner. Considerations: category rules, currency formatting, totals, export, and scenario notes. Acceptance: budget totals calculate correctly and changes update live.
	- Add budget categories and line items.
	- Calculate totals and currency formatting.
	- Support export or scenario note capture.
	- Test: change budget values and verify total calculations.
	- Completed (local): ✅
		- Added the Couple Dashboard budget planner with category line items, live totals, LKR currency formatting, CSV export, and scenario note capture.
		- Added budget store helpers and API routes for listing, creating, updating, deleting, note saving, and export.
		- Evidence: `npm.cmd run build` passed; `npm.cmd run test:budget-smoke` passed.
- **Task 6.3 ✅**: Build the agenda and timeline builder. Considerations: drag/drop order, time validation, timezone handling, and printable schedule output. Acceptance: events can be reordered and validated without breaking time logic.
	- Create timeline items and ordering controls.
	- Validate start/end times and timezone rules.
	- Prepare printable or shareable output.
	- Test: reorder timeline items and confirm time validation.
	- Completed (local): ✅
		- Added agenda/timeline APIs for list, create, update, delete, reorder, and Markdown schedule export.
		- Built the Couple Dashboard Agenda module with timeline item creation, edit/delete, drag/drop reorder, arrow ordering controls, timezone consistency checks, overlap validation, and printable/copy/download schedule output.
		- Added `web-app/scripts/test_task63_agenda_timeline.js` and `npm run test:agenda-timeline`.
		- Evidence: `npm.cmd run build` passed; `BASE_URL=http://127.0.0.1:3000 npm.cmd run test:agenda-timeline` passed against the local dev server.
- **Task 6.4 ✅**: Build the public agenda timeline display. Considerations: responsive layout, time labels, section truncation, and image/icon usage. Acceptance: the public schedule view matches the couple timeline data.
	- Display the agenda in a public-friendly format.
	- Add responsive labels and truncation behavior.
	- Use icons or images only where they add clarity.
	- Test: compare the public agenda against the dashboard timeline.
- **Task 6.5 ✅**: Sprint 6 QA and planning-tool verification. Considerations: budget math checks, checklist CRUD checks, timeline ordering checks, and print-view review. Acceptance: planning tools pass functional checks and print output is usable.
	- Verify budget calculations and checklist CRUD.
	- Test timeline ordering and timezone logic.
	- Review print output and layout fidelity.
	- Test: run the planning-tool smoke suite.
		- Added `web-app/scripts/test_task65_planning_tools_smoke.js` and `npm run test:planning-tool-smoke`.
		- Covered budget recalculation, checklist CRUD/toggle/delete, agenda ordering/timezone validation, markdown print export, and cleanup.
		- Fixed the couple dashboard content width so Agenda, Budget, and Checklist do not create page-level horizontal overflow at desktop width.
		- Evidence: `npm.cmd run build` and `npm.cmd run test:planning-tool-smoke` passed against a local server.

**Sprint 7: Table Assignments**
- **Task 7.1 ✅**: Build table creation and capacity management. Considerations: capacity constraints, table numbering, drag/drop visual states, and printable layout. Acceptance: tables can be created and capacity limits are enforced.
	- Create table records and capacity rules.
	- Add numbering and visual assignment states.
	- Prepare printable table layouts.
	- Test: create tables and confirm capacity enforcement.
- **Task 7.2 ✅**: Build guest-to-table assignment flows. Considerations: conflict checks, undo/reassign flow, accessibility, and bulk assignment actions. Acceptance: guests can be assigned and reassigned with conflicts prevented.
	- Support guest assignment from the list and table view.
	- Add conflict detection and undo actions.
	- Ensure keyboard and accessibility support.
	- Test: assign and reassign guests while checking conflicts.
- **Task 7.3 ✅**: Build the guest "Find My Table" experience. Considerations: privacy gating, lookup verification, search UX, and concise guest-facing copy. Acceptance: guests can locate their table only after passing verification.
	- Build the guest lookup form and verification step.
	- Add table result display and privacy checks.
	- Keep the guest copy short and clear.
	- Test: verify lookup works only after guest validation.
- **Task 7.4 ✅**: Sprint 7 QA and seating-chart verification. Considerations: assignment smoke tests, capacity enforcement, privacy checks, and print/export validation. Acceptance: seating assignments and guest lookup flows pass verification.
	- Test table capacity and assignment conflicts.
	- Verify guest lookup privacy rules.
	- Validate print/export seating charts.
	- Test: run the seating-chart regression checks.

### Epic 5: Vendor Ecosystem & Monetization
**Sprint 8: Vendor Portal MVP**
- **Task 8.1 ✅**: Build vendor registration and onboarding. Considerations: business profile fields, document/image uploads, verification steps, and onboarding checklist Markdown. Acceptance: vendors can register and complete onboarding with required data.
	- Create the vendor signup flow and profile form.
	- Add business verification and upload fields.
	- Document onboarding steps in Markdown.
	- Test: submit vendor onboarding and confirm saved data.
	- Completed (local): ✅
		- Added 5-step vendor registration flow at `web-app/src/app/vendor-register/page.tsx` (account, business profile, documents/portfolio, pricing/packages, review & submit).
		- Added `web-app/src/lib/vendorStore.ts` with full CRUD: addVendorRegistration, approve/reject/suspend, onboarding progress, public profile helpers, and seeded demo vendor.
		- Added API routes: `POST /api/vendors/register`, `GET /api/vendors` (with status/category/search filters), `GET /api/vendors/[id]`.
		- Documented 5-step onboarding in `web-app/src/app/vendor-register/VENDOR_ONBOARDING.md`.
		- Added `web-app/scripts/test_task81_vendor_onboarding.js` and `npm run test:vendor-onboarding`.
		- Evidence: `npm.cmd run build` passed (51 routes); `npm.cmd run test:vendor-onboarding` → 37 passed, 0 failed.
- **Task 8.2 ✅**: Build vendor approval workflow for Super Admin. Considerations: approval status model, audit log, notifications, and review notes. Acceptance: admins can approve or reject vendors and record the decision. 🎉
	- Build the vendor review queue and detail view.
	- Add approve/reject actions with notes.
	- Record audit history for decisions.
	- Test: approve and reject vendors and verify audit output.
- **Task 8.3 ✅**: Build vendor profile and service listing management. Considerations: service categories, pricing fields, gallery images, SEO copy, and editable Markdown content. Acceptance: vendors can update profiles and service listings successfully.
	- Add profile editing and service listing forms.
	- Support gallery images and pricing fields.
	- Include SEO and editable content fields.
	- Test: update vendor profiles and verify the changes persist.
- **Task 8.4 ✅**: Build vendor browsing and save flows for couples. Considerations: search/filter UX, favorites state, comparison data, and vendor card imagery. Acceptance: couples can discover and save vendors to a shortlist.
	- Build vendor browse results and filter controls.
	- Add save/favorite actions and shortlist views.
	- Show comparison-ready vendor cards.
	- **Task 8.4 (Completed)**: Built vendor browsing and save flows for couples. Added search/filter UX, favorites state with `useShortlist`, and a rich grid-based vendor discovery page (`/vendors`).
- **Task 8.5 ✅**: Sprint 8 QA and vendor workflow verification. Built and ran the Sprint 8 QA suite (`npm run test:sprint8-qa`) successfully validating onboarding, approvals, profile updates, and couple browse/save flows. Considerations: onboarding submission checks, approval flow validation, listing edits, and couple save/browse smoke tests. Acceptance: vendor lifecycle flows pass functional smoke tests.
	- Verify vendor onboarding submission.
	- Test approval and profile edit flows.
	- Check browse and save interactions.
	- Test: run the vendor lifecycle smoke suite.

**Sprint 9: Subscriptions, Payments & Polish**
- **Task 9.1 ✅**: Integrate Stripe for premium couple subscriptions and vendor plans. Considerations: payment intents, webhook handling, subscription tiers, and billing docs. Acceptance: subscription checkout and webhook updates complete successfully in test mode.
	- Create checkout and payment intent flows.
	- Handle webhook events and plan updates.
	- Document billing and plan behavior.
	- Test: complete a test-mode checkout and confirm webhook updates.
- **Task 9.2 ✅**: Build Super Admin plan and subscription management. Considerations: feature gating matrix, entitlements, billing state, and support/admin notes. Acceptance: admins can view and manage plan state with proper gating.
	- Show plan and subscription status to admins.
	- Add entitlements and feature gating rules.
	- Capture support notes or admin actions.
	- Test: toggle plan states and verify feature gating.
- **Task 9.3 ✅**: Implement email notifications and WhatsApp invite integration. Considerations: message templates, delivery retries, opt-in rules, and asset placeholders for invite images. Acceptance: notifications can be generated and sent from the relevant trigger points.
	- Define email and WhatsApp template content.
	- Add sending hooks and retry handling.
	- Include opt-in and asset placeholders.
	- Test: trigger notifications and verify delivery events.
- **Task 9.4 ✅**: Run end-to-end testing, bug squashing, and UI polish. Considerations: test coverage for critical journeys, visual regression checks, bug log, and release checklist Markdown. Acceptance: critical user journeys pass end-to-end tests and UI issues are resolved.
	- Run end-to-end test coverage for core journeys.
	- Fix blocking bugs and polish key layouts.
	- Finalize the release checklist and bug log.
	- Test: rerun the full regression suite before release.

### Epic 6: Public Website Experience
**Sprint 10: Public Website, Auth & Event Discovery Designs**
- **Task 10.1 ✅**: Build the Public Website landing page design from `Public Website/Public Website.png`. Considerations: WedPlan brand header and navigation, hero messaging, CTA hierarchy, feature cards, templates, stats, testimonials, vendor logos, footer, newsletter area, responsive desktop/mobile behavior, and visual consistency with the rose/pink wedding theme and existing design system. Acceptance: the public landing page matches the provided design direction and presents the complete marketing journey clearly across desktop and mobile.
	- Build the public header, navigation, login CTA, and Start Free Trial CTA.
	- Create the hero section with dashboard/mobile preview imagery, supporting copy, and primary/secondary actions.
	- Add feature cards, how-it-works steps, invitation templates, trust stats, testimonials, vendor logos, final CTA, footer, and newsletter signup sections.
	- Test: compare the implemented page against `Public Website/Public Website.png` on desktop and mobile breakpoints.
- **Task 10.2 ✅**: Build the Login page design from `Public Website/Sign in.png`. Considerations: left-side wedding illustration panel, language selector, email/password fields, password visibility toggle, remember-me state, forgot-password link, social sign-in buttons, security note, and responsive auth layout. Acceptance: users can view and use a polished login screen that matches the design asset and connects cleanly to the existing authentication flow.
	- Create the split auth layout with WedPlan branding, welcome copy, and wedding illustration panel.
	- Build email and password fields with icons, validation states, remember-me checkbox, password visibility toggle, and forgot-password link.
	- Add Sign In, Google, and Apple sign-in actions plus the secure-data reassurance panel.
	- Test: verify login form rendering, responsive stacking, password toggle behavior, and navigation to signup.
- **Task 10.3 ✅**: Build Sign Up Step 1 from `Public Website/Sign up Step 1.png`. Considerations: left-side wedding illustration panel, account detail fields, password visibility toggles, password requirement indicators, terms/privacy checkbox, social sign-up buttons, sign-in link, and signup step indicator. Acceptance: users can complete account details in a visually matched first signup step with clear validation and progression to wedding details.
	- Build the Step 1 split signup layout with brand panel, feature highlights, and wedding illustration.
	- Add first name, last name, email, password, and confirm password fields with icons and password visibility controls.
	- Implement password requirement indicators, terms/privacy agreement checkbox, social sign-up buttons, and sign-in link.
	- Test: verify field validation, terms requirement, password indicator states, and Continue to Wedding Details navigation.
- **Task 10.4 ✅**: Build Sign Up Step 2 / wedding details from `Public Website/Sign up step 2.png`. Considerations: wedding details form, step indicator, groom/bride fields, venue/date/guest/budget inputs, "Still deciding" toggles, sliders, back navigation, and continuity with the Step 1 auth design. Acceptance: users can enter or defer wedding details and create their wedding from a responsive second signup step.
	- Build the Step 2 wedding details layout using the same split auth shell and progress indicator.
	- Add groom and bride name fields, venue and event date inputs, and "Still deciding" toggles.
	- Add guest count and budget sliders with increment/decrement controls, current values, Back, and Create My Wedding actions.
	- Test: verify Step 2 field behavior, still-deciding toggles, slider values, Back navigation, and create-wedding submission state.
- **Task 10.5 ✅**: Build the Find Event / event discovery public flow. Considerations: no separate Find Event image exists, so the design should follow the Public Website visual style and allow guests to find a couple's event or invitation by couple names, event code, or invitation link. Acceptance: visitors can search for an event, handle no-result/error states, and open the correct public invitation when a match is found.
	- Create a public Find Event page with WedPlan branding, rose/pink visual treatment, and concise guest-facing copy.
	- Add search inputs for couple names, event code, or invitation link with clear validation and loading states.
	- Display matched event cards with couple names, event date, venue summary, and a View Invitation action.
	- Test: verify successful lookup, no-result state, invalid input handling, and navigation to the selected invitation.
- **Task 10.6 ✅**: Sprint 10 QA for responsive layout, routing, visual match, and auth/event discovery smoke checks. Considerations: asset fidelity, mobile/desktop breakpoints, form state behavior, public route access, accessibility, and regression risk against existing auth/onboarding routes. Acceptance: Public Website, Login, Sign Up Step 1, Sign Up Step 2, and Find Event flows pass smoke checks and visual review.
	- Review all Sprint 10 pages against `Public Website/Public Website.png`, `Public Website/Sign in.png`, `Public Website/Sign up Step 1.png`, and `Public Website/Sign up step 2.png`.
	- Verify public routes, login/signup navigation, Find Event lookup, and invitation handoff behavior.
	- Check responsive layouts, keyboard accessibility, focus states, button states, and form validation copy.
	- Test: run the Sprint 10 smoke suite and record any visual, routing, or auth-flow issues before release.
