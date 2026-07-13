# Skills (maintenance phase)

The build is complete. Day-to-day work is now **bug fixes** and **small feature changes**,
done on a single track — not the 12-agent parallel build (archived in `claude/archive/`).

## Runnable skills
These are real skills in `.claude/skills/` — invoke them with a slash command:

| Skill | When to use |
|---|---|
| `/fix-bug` | Something is broken/wrong: page error, failing flow, wrong data, broken link, UI defect |
| `/add-small-feature` | New field, button, small screen, option, copy change, or a tweak to a flow |
| `/ship-check` | Before committing / opening a PR: build + lint + typecheck + the relevant smoke test |

Global skills also apply: `/code-review` (review the diff), `/verify` (run the app and
confirm a change works), `/security-review` (security pass on the branch).

## Engineering standards (enforced by every change)

### Error fixing
- Find the root cause before fixing — don't patch symptoms.
- Watch for Next.js client/server boundaries (`'use client'`), broken `@/` imports, and
  stale smoke-script ports.

### API handling
- Every route: verify session → check role → check ownership.
- Consistent response shape; structured errors with proper HTTP status; never leak stack
  traces. Validate inputs at the boundary.

### Database & migration
- Avoid schema changes in maintenance. If unavoidable: `prisma migrate dev` (dev) /
  `prisma migrate deploy` (prod). Never edit applied migrations. Seed stays idempotent.
- SQLite (`dev_sqlite.db`) is local-dev only; Supabase Postgres is production.

### UI / UX
- Design tokens from `web-app/src/lib/design-tokens.css` — no raw hex.
- Loading / empty / error states required. Mobile-first; check 375px and 1440px.
- No "Coming Soon" placeholders without a logged item in `todo.md`.

### Branding
- Brand name is **WedPlan** everywhere (titles, meta, auth copy, emails).

### Security
- Guest names/RSVPs never exposed in public endpoints without auth.
- Ownership checks on vendor/couple data; `SUPER_ADMIN` role on admin endpoints.
- Uploads: validate MIME type + size. No secrets in code. Destructive admin actions logged
  to `web-app/logs/audit.log`.

### QA / release
- `npm run build` must pass before anything is called done.
- Run the smoke test closest to the change; `npm run test:e2e` for broad changes.
- Report status honestly — never claim green without the output.
