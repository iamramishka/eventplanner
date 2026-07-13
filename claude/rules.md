# Project Rules

## Git & Branch Rules
- `main` is the live production branch — PR-only, never force-push
- The old `dev` integration branch was merged into `main` and **deleted**; branch new work
  directly from `main` (e.g. `fix/...`, `feat/...`)
- Commit messages: `type(scope): description` (conventional commits)
- PR must pass `npm run build` before merge

## Code Rules
- TypeScript strict mode — no `any` without justification
- All API routes: authenticate session → check role → check resource ownership
- No in-memory stores in production paths — use Prisma
- No secrets in code — use `.env` (already in `.gitignore`)
- Prisma migrations only via `prisma migrate dev` or `prisma migrate deploy`
- Avoid schema changes in maintenance; treat `web-app/prisma/schema.prisma` as high-risk

## UI Rules
- Brand name: **WedPlan** (not WedInvite)
- Design tokens from `web-app/src/lib/design-tokens.css` — no raw hex colors in components
- Rose/Champagne Gold/Sage Green color palette
- All new pages must be responsive (mobile-first)
- Empty states and loading states are required — not optional
- Design mockup PNGs are in `Couple Dashboard/`, `Super Admin/`, `Vendor Portal/`, `invitation Page/`, `Public Website/` — read-only references

## High-risk shared files (change carefully)
- `prisma/schema.prisma`, `src/lib/auth.ts`, `middleware.ts` — touch only when the fix
  genuinely requires it, and call it out explicitly in the commit.
- The 12-lane worktree process is retired; see `claude/archive/` for that historical setup.

## Security Rules
- Guest data (names, RSVPs) must never be exposed in public endpoints without auth
- Vendor documents require ownership checks
- Admin endpoints require `SUPER_ADMIN` role
- Upload endpoints: validate file type + size before storing
- Audit log (`web-app/logs/audit.log`) must record all destructive admin actions

## QA Rules
- Each sprint delivers a `scripts/test_task*.js` smoke test
- `npm run build` must pass before any task is marked complete
- Browser screenshots required for all UI tasks (desktop + mobile)
- Smoke tests run against `http://localhost:3000` by default
