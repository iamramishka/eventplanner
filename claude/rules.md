# Project Rules

## Git & Branch Rules
- Never force-push to `main` or `dev`
- Always branch from `dev` for new work
- Worktree branches use `codex/` prefix
- Commit messages: `type(scope): description` (conventional commits)
- PR must pass `npm run build` before merge
- Merge order: stabilize → design-system → data-auth → features → qa → security → docs

## Code Rules
- TypeScript strict mode — no `any` without justification
- All API routes: authenticate session → check role → check resource ownership
- No in-memory stores in production paths — use Prisma
- No secrets in code — use `.env` (already in `.gitignore`)
- Prisma migrations only via `prisma migrate dev` or `prisma migrate deploy`
- Never modify `web-app/prisma/schema.prisma` without coordinating Data/Auth lane

## UI Rules
- Brand name: **WedPlan** (not WedInvite)
- Design tokens from `web-app/src/lib/design-tokens.css` — no raw hex colors in components
- Rose/Champagne Gold/Sage Green color palette
- All new pages must be responsive (mobile-first)
- Empty states and loading states are required — not optional
- Design mockup PNGs are in `Couple Dashboard/`, `Super Admin/`, `Vendor Portal/`, `invitation Page/`, `Public Website/` — read-only references

## Lane Rules (Worktrees)
- Each agent owns its lane only (see `claude/agents.md`)
- If a lane needs a shared file, document the reason in commit notes
- Never revert another lane's committed work
- Shared files that need coordination: `prisma/schema.prisma`, `src/lib/auth.ts`, `middleware.ts`

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
