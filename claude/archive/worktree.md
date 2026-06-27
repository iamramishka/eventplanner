# Worktree Execution Plan

## Setup

Worktrees live **outside** the repo at `C:\Users\ramis\Downloads\wed-plan-worktrees`.
Base branch for all new worktrees: `dev`

### Create Missing Worktree (run first)
```powershell
git worktree add -b codex/stabilize-build-lint "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-01-stabilize" dev
```

### Create All Worktrees (full setup from scratch)
```powershell
New-Item -ItemType Directory -Force -Path "C:\Users\ramis\Downloads\wed-plan-worktrees"

git worktree add -b codex/stabilize-build-lint      "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-01-stabilize"     dev
git worktree add -b codex/data-auth-rbac             "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-02-data-auth"      dev
git worktree add -b codex/super-admin-full-control   "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-03-super-admin"    dev
git worktree add -b codex/public-site-design-align   "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-04-public-site"    dev
git worktree add -b codex/couple-dashboard-align     "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-05-couple-dashboard" dev
git worktree add -b codex/vendor-portal-complete     "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-06-vendor-portal"  dev
git worktree add -b codex/invitation-flow-align      "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-07-invitation"     dev
git worktree add -b codex/billing-pricing-entitlements "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-08-billing"      dev
git worktree add -b codex/design-system-branding     "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-09-design-system"  dev
git worktree add -b codex/qa-smoke-browser           "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-10-qa-automation"  dev
git worktree add -b codex/security-privacy-audit     "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-11-security-review" dev
git worktree add -b codex/docs-release-checklist     "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-12-docs-release"   dev
```

### If Branches Already Exist (add to existing branch)
```powershell
git worktree add "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-02-data-auth"       codex/data-auth-rbac
git worktree add "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-03-super-admin"     codex/super-admin-full-control
git worktree add "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-04-public-site"     codex/public-site-design-align
git worktree add "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-05-couple-dashboard" codex/couple-dashboard-align
git worktree add "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-06-vendor-portal"   codex/vendor-portal-complete
git worktree add "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-07-invitation"      codex/invitation-flow-align
git worktree add "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-08-billing"         codex/billing-pricing-entitlements
git worktree add "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-09-design-system"   codex/design-system-branding
git worktree add "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-10-qa-automation"   codex/qa-smoke-browser
git worktree add "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-11-security-review" codex/security-privacy-audit
git worktree add "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-12-docs-release"    codex/docs-release-checklist
```

---

## Worktree Map

| # | Path | Branch | Agent |
|---|---|---|---|
| 01 | `wed-plan-wt-01-stabilize` | `codex/stabilize-build-lint` | Build/Error Fix |
| 02 | `wed-plan-wt-02-data-auth` | `codex/data-auth-rbac` | Data/Auth |
| 03 | `wed-plan-wt-03-super-admin` | `codex/super-admin-full-control` | Super Admin Backend |
| 04 | `wed-plan-wt-04-public-site` | `codex/public-site-design-align` | Public Site UI |
| 05 | `wed-plan-wt-05-couple-dashboard` | `codex/couple-dashboard-align` | Couple Dashboard |
| 06 | `wed-plan-wt-06-vendor-portal` | `codex/vendor-portal-complete` | Vendor Portal |
| 07 | `wed-plan-wt-07-invitation` | `codex/invitation-flow-align` | Invitation Flow |
| 08 | `wed-plan-wt-08-billing` | `codex/billing-pricing-entitlements` | Billing |
| 09 | `wed-plan-wt-09-design-system` | `codex/design-system-branding` | Design System |
| 10 | `wed-plan-wt-10-qa-automation` | `codex/qa-smoke-browser` | QA Automation |
| 11 | `wed-plan-wt-11-security-review` | `codex/security-privacy-audit` | Security Reviewer |
| 12 | `wed-plan-wt-12-docs-release` | `codex/docs-release-checklist` | GitHub Release |

---

## Useful Worktree Commands

```powershell
# List all worktrees
git worktree list

# Remove a worktree (after its branch is merged)
git worktree remove "C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-01-stabilize"

# Prune stale worktree references
git worktree prune
```

---

## Lane Rules
- Each worktree owns only its assigned lane (see `claude/agents.md`)
- If a lane needs a shared file (`prisma/schema.prisma`, `middleware.ts`, `src/lib/auth.ts`), document the reason in the commit
- Never rebase a worktree branch onto another worktree branch — always rebase onto `dev`
- After merge, remove the worktree with `git worktree remove` to keep the workspace clean
