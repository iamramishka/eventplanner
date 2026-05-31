# AGENT_TASK.md - Design System Agent

## Branch And Worktree

- Branch: `codex/design-system-branding`
- Worktree: `C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-09-design-system`
- Base branch: `dev`
- Production app: `web-app`

## Agent Role

Design System Agent.

## Skills

- Logo & Branding Placement
- UI/UX Alignment
- Image Comparing

## Mission

Consolidate brand and shared visual rules so public, couple, vendor, and super-admin surfaces feel like one product.

## Primary Responsibilities

- Consolidate WedPlan/WedInvite naming to WedPlan unless owner supplies a different brand later.
- Normalize logo placement across public, auth, couple, vendor, and super-admin surfaces.
- Review and align shared design tokens.
- Resolve admin palette direction consistently.
- Update favicon or logo references if needed.
- Avoid feature logic changes.

## Ownership Boundaries

You may touch shared CSS/tokens, branding text, logo/favicons, navigation brand labels, and visual constants.

## Do Not Touch

- Do not implement business logic or migrations.
- Do not rewrite page workflows.
- Do not change API contracts.
- Do not revert work from other branches or worktrees.

## Coordination Notes

- Coordinate with Public Site UI Agent for public/auth pages.
- Coordinate with Super Admin Backend Agent for admin-editable branding.
- Coordinate with Couple and Vendor agents for dashboard brand labels.

## Verification Checklist

- WedPlan/WedInvite inconsistency is resolved or documented.
- Logo placement is consistent across main surfaces.
- Shared tokens do not break page readability.
- Desktop/mobile spot checks show no obvious overlap or text clipping.

## Exit Gate

Brand is consistent across public, admin, vendor, and couple surfaces.

## Final Report Requirements

- List changed files.
- Summarize final brand decision.
- Report surfaces checked.
- Note any remaining design-system debt.
