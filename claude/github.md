# GitHub Activities & Workflow (maintenance phase)

The build is complete and merged. Work is now small, single-track fixes and changes off
`main`. The old `dev` integration branch and the `codex/*` worktree lanes are retired (see
`claude/archive/` for that historical setup).

## Branch Strategy

```
main          ← live, production, PR-only, never force-push
  └── fix/*   ← one bug fix per branch
  └── feat/*  ← one small feature per branch
```

- Branch directly from `main`.
- Keep each branch to a single bug or feature so review and rollback stay easy.
- Conventional commits: `fix(scope): …`, `feat(scope): …`, `docs:`, `chore:`, etc.

## Pull Request flow

1. Branch from `main`, make the change.
2. Run `/ship-check` (build + lint + typecheck + relevant smoke test).
3. Open a PR into `main` using the template below.
4. Merge after the build gate passes.

### PR Template
```markdown
## What
[1-3 bullets: what changed]

## Why
[the bug being fixed or the feature being added]

## Evidence
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] Smoke test: `npm run test:*` result
- [ ] Manual check: desktop 1440px / mobile 375px (if UI)
```

## CI on PR to `main`
```yaml
name: CI
on: [pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd web-app && npm ci
      - run: cd web-app && npm run build
      - run: cd web-app && npm run lint
```

## Release / deploy

Production is on Vercel (https://invitemyguestplanner.vercel.app/), deploying from `main`
against Supabase Postgres. Before merging to `main`:

- [ ] `npm run build` passes from a clean checkout
- [ ] Relevant smoke test(s) pass; `npm run test:e2e` for broad changes
- [ ] If a schema change was unavoidable, the Postgres migration is verified (not just SQLite)
- [ ] Known issues / notes updated in `claude/todo.md`
