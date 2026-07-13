---
name: fix-bug
description: Structured workflow for fixing a bug in the WedPlan web-app. Use when the user reports something broken, wrong, or not working — a page error, a flow that fails, wrong data, a broken link, a UI defect. Walks reproduce → locate → root-cause → fix → verify, using this project's routes, smoke tests, and conventions.
---

# Fix a WedPlan bug

The app is in **maintenance phase** — the build is complete and live. Fix the reported
defect with the smallest correct change. Do **not** redesign features or expand the Prisma
schema unless the bug genuinely requires it.

## 1. Reproduce first
- Get exact steps: which URL, which role (couple / vendor / super admin / guest), what they
  did, what happened vs. what they expected.
- Run the app and reproduce it yourself before changing anything:
  ```
  cd web-app && npm run dev   # http://localhost:3000
  ```
- Local dev uses **SQLite** (`DATABASE_URL=file:./dev_sqlite.db`). Production is Supabase
  Postgres. If a bug only appears in prod, suspect the schema-switch (`postinstall` runs
  `scripts/prisma-schema-switch.js`).

## 2. Locate
- Pages & routes live under `web-app/src/app/`. Shared helpers, auth, and stores under
  `web-app/src/lib/`.
- Canonical invitation route is `app/invitation/[slug]/` (the old `(public)/[slug]` was a
  duplicate — don't reintroduce it).
- Use Grep/Glob to find the component or API route, not guesswork.

## 3. Root-cause, don't patch symptoms
- Find *why* it breaks, not just where the error surfaces.
- Common classes in this codebase: Next.js client/server boundary (`'use client'`
  placement), broken `@/` import paths, missing auth/ownership check, store vs. Prisma
  mismatch, stale smoke-script port.

## 4. Fix to the codebase's standards
- Match surrounding code style.
- API routes must: **verify session → check role → check ownership**. Never weaken this.
- UI: use design tokens from `web-app/src/lib/design-tokens.css` — no raw hex. Keep
  loading / empty / error states.
- Brand name is **WedPlan** everywhere.

## 5. Verify before you call it done
- Run the smoke test closest to the area (see `web-app/package.json` scripts), e.g.
  `npm run test:rsvp-token`, `npm run test:find-table`, `npm run test:plans`.
- Run the quality gate: `/ship-check` (build + lint + typecheck).
- Re-run your original reproduction steps and confirm it's actually fixed.
- Report honestly: if a smoke test fails, say so with the output.

## 6. Commit (only when asked)
- Branch from **`main`** (the `dev` branch no longer exists). Never force-push.
- Conventional commit: `fix(scope): description`.
