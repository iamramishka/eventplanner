# WedPlan — Project Context for Claude Code

## Project
WedPlan is a wedding planning SaaS with four domains:
- **Couple Dashboard** — private workspace for couples (`/couple`)
- **Super Admin** — platform control (`/super`)
- **Vendor Portal** — vendor workspace (`/vendor`)
- **Public Invitation** — guest-facing invitation (`/invitation/[slug]`)

## Tech Stack
- **Framework**: Next.js (App Router) — `web-app/`
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom design tokens (`web-app/src/lib/design-tokens.css`)
- **Database**: PostgreSQL via Prisma ORM (`web-app/prisma/schema.prisma`)
- **Auth**: NextAuth.js with COUPLE / VENDOR / SUPER_ADMIN roles
- **Payments**: Stripe (sandbox)
- **Storage**: Cloudinary / AWS S3 (planned)

## Key Directories
```
web-app/                  Production Next.js app
  src/app/                App Router pages & API routes
  src/lib/                Shared helpers, auth, stores
  prisma/                 Schema, migrations, seed
  scripts/                Smoke test scripts
Couple Dashboard/         UI mockup PNGs (reference)
Super Admin/              UI mockup PNGs (reference)
Vendor Portal/            UI mockup PNGs (reference)
invitation Page/          UI mockup PNGs (reference)
Public Website/           UI mockup PNGs (reference)
plan.md                   Agile sprint plan (source of truth for sprints 1-10)
coupleadmin.md            Couple Dashboard product spec
invitation.md             Invitation website product spec
list.md                   Worktree execution plan
claude/                   Agent, skill, GitHub, and rules docs
```

## How to Run
```powershell
cd web-app
npm install
npm run dev        # starts on http://localhost:3000
npm run build      # production build check
npm run lint       # lint check
```

## Branch Strategy
- `main` — stable production branch, PR-only merges
- `dev` — integration branch, all feature merges go here first
- `codex/*` — feature worktrees (see `claude/worktree.md`)
- Never force-push to `main` or `dev`
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

## Agent & Skill System
All agent assignments, skills, worktree commands, GitHub workflow, rules, and todo list live in `claude/`. Read those files before starting any significant task.

## Important Rules
1. The production app is `web-app/`. Root `src/` is deprecated.
2. Brand name is **WedPlan** everywhere (not WedInvite).
3. Each worktree lane owns its scope — do not overwrite other lanes' work.
4. Protected data: never delete `web-app/prisma/dev_sqlite.db` or `web-app/logs/audit.log`.
5. Postgres is the production DB. SQLite (`dev_sqlite.db`) is local dev only.
6. All new API routes need session + role + ownership checks.
7. Design mockup folders (PNGs) are read-only references — never rename them during feature work.
