# AGENT_TASK.md - Couple Dashboard Agent

## Branch And Worktree

- Branch: `codex/couple-dashboard-align`
- Worktree: `C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-05-couple-dashboard`
- Base branch: `dev`
- Production app: `web-app`

## Agent Role

Couple Dashboard Agent.

## Skills

- Feature Comparing
- UI/UX Alignment
- Flow Testing

## Mission

Bring the Couple Dashboard closer to `coupleadmin.md` and the `Couple Dashboard` mockups while preserving existing working modules.

## Primary Responsibilities

- Compare current couple dashboard against `coupleadmin.md`.
- Add or complete missing couple modules for vendors, music, account/subscription, notifications, and advanced seating polish.
- Remove "Soon" states for core couple modules where a usable v1 can be built.
- Preserve existing guests, RSVP, agenda, gallery, budget, checklist, and table functionality.
- Keep dashboard UI dense, operational, and responsive.

## Ownership Boundaries

You may touch couple dashboard routes, couple dashboard components, couple-specific API consumers, and couple dashboard styles.

## Do Not Touch

- Do not rewrite vendor portal internals.
- Do not implement Super Admin CMS.
- Do not change auth primitives except to consume existing session/role data.
- Do not revert work from other branches or worktrees.

## Coordination Notes

- Coordinate with Vendor Portal Agent for shared vendor data contracts.
- Coordinate with Billing Agent for account/subscription display and entitlement behavior.
- Coordinate with Design System Agent for shared tokens and branding.

## Verification Checklist

- Existing couple dashboard modules still load.
- New couple modules have usable empty/loading/error states.
- No core couple module remains marked "Soon" without a documented reason.
- Main couple flows still work: guests, RSVPs, budget, checklist, agenda, tables, invitation editor.

## Exit Gate

Couple dashboard matches the spec direction and has no undocumented "Soon" core modules.

## Final Report Requirements

- List changed files.
- List completed modules.
- List any remaining couple dashboard gaps.
- Report manual or automated flow checks.
