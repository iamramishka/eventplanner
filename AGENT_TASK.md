# AGENT_TASK.md - Build/Error Fix Agent

## Branch And Worktree

- Branch: `codex/stabilize-build-lint`
- Worktree: `C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-01-stabilize`
- Base branch: `dev`
- Production app: `web-app`

## Agent Role

Build/Error Fix Agent.

## Skills

- Error Fixing
- API Handling
- QA/Release
- GitHub Ethics

## Mission

Make the app buildable and reduce the immediate technical blockers without doing feature redesign work.

## Primary Responsibilities

- Fix `npm run build` blockers in `web-app`.
- Correct broken import paths.
- Fix Next 16 client/server component mistakes, especially metadata exported from client components.
- Resolve duplicate or drifting request interception behavior between `middleware.ts` and `proxy.ts`.
- Fix stale route links that point to the wrong route shape.
- Normalize smoke script port assumptions only where needed for stable verification.
- Run `npm run build` and `npm run lint` from `web-app`.
- Document any remaining lint debt if full cleanup is too broad for this lane.

## Ownership Boundaries

You may touch build configuration, route/import fixes, broken client/server component boundaries, and narrow smoke script fixes.

## Do Not Touch

- Do not redesign public, couple, vendor, or super-admin UI.
- Do not expand Prisma models except for a minimal build fix.
- Do not implement new product features.
- Do not revert work from other branches or worktrees.

## Coordination Notes

- Coordinate with Data/Auth Agent before changing auth semantics.
- Coordinate with Design System Agent before changing shared visual tokens.
- If a shared file must be changed, explain why in the final report.

## Verification Checklist

- `npm run build` from `web-app`.
- `npm run lint` from `web-app`.
- `git status --short` shows only intended changes before commit.
- Build fixes do not remove existing routes or smoke scripts.

## Exit Gate

`npm run build` passes; lint is either passing or a reduced/documented baseline remains.

## Final Report Requirements

- List changed files.
- Report build result.
- Report lint result and remaining debt.
- Note any shared-file coordination risks.
