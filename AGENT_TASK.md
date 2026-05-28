# AGENT_TASK.md - Vendor Portal Agent

## Branch And Worktree

- Branch: `codex/vendor-portal-complete`
- Worktree: `C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-06-vendor-portal`
- Base branch: `dev`
- Production app: `web-app`

## Agent Role

Vendor Portal Agent.

## Skills

- Feature Comparing
- API Handling
- UI/UX Alignment

## Mission

Replace placeholder vendor portal modules with usable v1 workflows while preserving current profile and listing functionality.

## Primary Responsibilities

- Complete bookings module with list/detail/status states.
- Complete availability module with usable calendar or rule controls.
- Complete messages module with enquiry/inbox states.
- Complete analytics module with meaningful metrics from available data.
- Complete payouts module with payout/billing history states.
- Complete settings module with account and notification preferences.
- Preserve current vendor profile and service listing management.

## Ownership Boundaries

You may touch vendor portal routes, vendor portal components, vendor APIs, vendor store/data access, and vendor styles.

## Do Not Touch

- Do not redesign couple dashboard or public landing.
- Do not implement Super Admin CMS controls.
- Do not rewrite auth primitives except to consume existing vendor session data.
- Do not revert work from other branches or worktrees.

## Coordination Notes

- Coordinate with Data/Auth Agent for vendor ownership and login behavior.
- Coordinate with Billing Agent for payouts/subscription dependencies.
- Coordinate with Couple Dashboard Agent for shared vendor discovery or booking contracts.

## Verification Checklist

- Vendor dashboard still loads.
- Profile edit still works.
- Listings CRUD still works.
- Bookings, availability, messages, analytics, payouts, and settings no longer show placeholder-only modules.
- Each module has empty/loading/error states.

## Exit Gate

Placeholder vendor modules are replaced with usable v1 states.

## Final Report Requirements

- List changed files.
- List completed vendor modules.
- Report preserved profile/listing checks.
- Note remaining vendor portal gaps.
