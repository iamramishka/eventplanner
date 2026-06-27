---
name: ship-check
description: Pre-commit / pre-push quality gate for the WedPlan web-app. Use before committing, before opening a PR, or whenever the user asks to "check", "verify the build", "make sure nothing broke", or confirm a change is safe to ship. Runs build + lint + typecheck and the relevant smoke tests, then reports pass/fail honestly.
---

# WedPlan ship-check (quality gate)

Run from `web-app/`. Report each step's real result — never claim green without the output.
Stop and surface the first failure with its error; don't keep going as if it passed.

## Gate steps (in order)

```bash
cd web-app

npm run typecheck   # tsc --noEmit — type errors
npm run lint        # eslint — must stay at 0 errors (lint debt was cleared)
npm run build       # next build — the hard release gate; must pass
```

> On Windows, `npm run build` ends with `-n was unexpected at this time` — that's the
> Vercel-only `postbuild` symlink script (bash syntax) running under cmd. It fires *after*
> `next build` succeeds and only matters on Vercel/Linux. If the route list printed above it,
> the build passed — ignore this line.

## Smoke tests (run the ones relevant to what changed)

Pick from `web-app/package.json` based on the area you touched:

| Area touched | Command |
|---|---|
| Invitation page | `npm run test:invitation-smoke` |
| RSVP token flow | `npm run test:rsvp-token` |
| Gallery | `npm run test:gallery-smoke` |
| Find-my-table / seating | `npm run test:find-table` · `npm run test:seating-chart` |
| Budget / checklist / agenda | `npm run test:budget-smoke` · `npm run test:checklist` |
| Vendor portal | `npm run test:vendor-profile-listings` · `npm run test:vendor-browse` |
| Billing / plans | `npm run test:billing-smoke` · `npm run test:plans` |
| Notifications | `npm run test:notifications` |
| Broad / unsure | `npm run test:e2e` (full regression gate) |

Smoke tests run against `http://localhost:3000` — start `npm run dev` in another shell first.

## Report format
- ✅ / ❌ per step with the key line of output.
- If everything passes: state it plainly and note it's safe to commit.
- If anything fails: show the failure, do **not** mark the work complete.
