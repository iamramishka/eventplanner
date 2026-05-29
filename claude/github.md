# GitHub Activities & Workflow

## Branch Strategy

```
main          ← stable, production-ready, PR-only
  └── dev     ← integration branch, all features merge here first
        └── codex/*  ← worktree feature branches
```

### Active Feature Branches (codex/)
| Branch | Status | Purpose |
|---|---|---|
| `codex/stabilize-build-lint` | **MISSING — create first** | Build fixes, import errors |
| `codex/data-auth-rbac` | Active | Prisma auth, RBAC |
| `codex/design-system-branding` | Active | Brand tokens, logo |
| `codex/super-admin-full-control` | Active | Admin controls |
| `codex/public-site-design-align` | Active | Public website UI |
| `codex/couple-dashboard-align` | Active | Couple dashboard modules |
| `codex/vendor-portal-complete` | Active | Vendor portal flows |
| `codex/invitation-flow-align` | Active | Invitation + RSVP + table finder |
| `codex/billing-pricing-entitlements` | Active | Stripe + plans |
| `codex/qa-smoke-browser` | Active | QA harness |
| `codex/security-privacy-audit` | Active | Security review |
| `codex/docs-release-checklist` | Active | Release docs |

### Stale Branches (review and close)
- `agents/commit-to-dev-branch`
- `agents/greeting-response-handler`
- `backup-before-undo`
- `codex/fix-pr-7-sentry-env`
- `pre-remove-zip`
- `subagent-Couple-Dashboard-Builder-portal-builder-828c0d39`
- `subagent-Invitation-Website-Builder-portal-builder-cfdc92cc`

---

## Merge Order

Must be followed strictly — later lanes depend on earlier ones:

1. `codex/stabilize-build-lint` — build must be green before anything else
2. `codex/design-system-branding` — tokens/brand needed by all UI lanes
3. `codex/data-auth-rbac` — auth needed by all feature lanes
4. Feature lanes (can be parallelized after step 3):
   - `codex/super-admin-full-control`
   - `codex/public-site-design-align`
   - `codex/couple-dashboard-align`
   - `codex/vendor-portal-complete`
   - `codex/invitation-flow-align`
   - `codex/billing-pricing-entitlements`
5. `codex/qa-smoke-browser` — after features are stable
6. `codex/security-privacy-audit` — after QA exposes final flows
7. `codex/docs-release-checklist` — last, after everything is verified

---

## PR Template

When creating a PR into `dev`, include:

```markdown
## What
[1-3 bullets: what changed]

## Why
[reason / linked sprint task from plan.md]

## Evidence
- [ ] `npm run build` passes
- [ ] `npm run lint` passes (or debt documented)
- [ ] Smoke test: `npm run test:*` result
- [ ] Browser screenshot: desktop 1440px
- [ ] Browser screenshot: mobile 375px

## Worktree
Branch: codex/xxx
Worktree: wed-plan-wt-XX-xxx
Agent: [agent name]
```

---

## GitHub Actions (Planned)

### CI on PR to `dev`
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

### Smoke Tests on PR
```yaml
  smoke:
    runs-on: ubuntu-latest
    steps:
      - run: cd web-app && npm run dev &
      - run: sleep 10 && npm run test:invitation-smoke
      - run: npm run test:rsvp-token
      - run: npm run test:sprint5-qa
```

---

## Release Checklist

Before merging `dev` → `main`:

- [ ] All `codex/*` lanes merged to `dev`
- [ ] `npm run build` passes from clean checkout
- [ ] All smoke test suites pass (`test:*`)
- [ ] Browser QA screenshots captured for all surfaces
- [ ] Security audit findings resolved or logged
- [ ] Postgres migration verified (not just SQLite)
- [ ] Release notes written in `claude/todo.md` (completed section)
- [ ] Stale branches cleaned up
- [ ] `superadmin.md` and `vendorportal.md` spec docs created
