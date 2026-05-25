# AGENT_TASK.md - Super Admin Backend Agent

## Branch And Worktree

- Branch: `codex/super-admin-full-control`
- Worktree: `C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-03-super-admin`
- Base branch: `dev`
- Production app: `web-app`

## Agent Role

Super Admin Backend Agent.

## Skills

- Super Admin Full Control
- API Handling
- Billing/Pricing
- Security Review

## Mission

Build persistent Super Admin controls for platform-wide settings and full site control.

## Primary Responsibilities

- Add persistent controls for branding, logo, contact numbers, and public-site settings.
- Add persistent controls for prices, plans, public CMS blocks, templates, logs, and audit history.
- Normalize Super Admin vendor and couple actions so UI calls match implemented APIs.
- Ensure admin edits persist and appear in relevant public/admin surfaces.
- Add audit logging for destructive or sensitive admin actions.

## Ownership Boundaries

You may touch Super Admin UI, Super Admin APIs, settings/CMS/branding data access, audit logging, and plan/pricing admin surfaces.

## Do Not Touch

- Do not rewrite low-level auth primitives unless required by Data/Auth lane.
- Do not redesign public pages beyond consuming admin-controlled content.
- Do not implement vendor portal feature modules.
- Do not revert work from other branches or worktrees.

## Coordination Notes

- Coordinate with Data/Auth Agent for admin authorization helpers.
- Coordinate with Billing Agent for plan/pricing schema and Stripe behavior.
- Coordinate with Design System Agent for logo/brand token decisions.

## Verification Checklist

- SUPER_ADMIN can update branding/settings.
- SUPER_ADMIN can update contact numbers.
- SUPER_ADMIN can update plans/prices or plan metadata.
- Admin changes persist after refresh.
- Sensitive admin actions create audit records.

## Exit Gate

Admin can edit site-wide settings and those changes persist and appear in the relevant public/admin UI.

## Final Report Requirements

- List changed files.
- List new or changed admin APIs.
- Describe persistence model.
- Report admin verification results and any remaining full-control gaps.
