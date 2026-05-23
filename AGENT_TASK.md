# AGENT_TASK.md - Data/Auth Agent

## Branch And Worktree

- Branch: `codex/data-auth-rbac`
- Worktree: `C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-02-data-auth`
- Base branch: `dev`
- Production app: `web-app`

## Agent Role

Data/Auth Agent.

## Skills

- Database & Migration
- API Handling
- Security Review

## Mission

Move critical demo and in-memory auth/data paths toward Prisma-backed persistence and enforce role/ownership checks on protected APIs.

## Primary Responsibilities

- Review current Prisma schema and in-memory stores.
- Persist couple registration and vendor registration through real user/account records where practical.
- Add role-aware API helpers for COUPLE, VENDOR, and SUPER_ADMIN access.
- Add ownership checks for wedding, guest, RSVP, vendor, and admin routes.
- Keep UI changes minimal and only where needed to complete data/auth behavior.
- Add or update focused verification for unauthenticated, wrong-role, and wrong-owner access.

## Ownership Boundaries

You may touch Prisma schema/migrations, auth helpers, API route guards, registration/login persistence, and narrow data access utilities.

## Do Not Touch

- Do not redesign public or dashboard UI.
- Do not implement full Super Admin CMS controls.
- Do not implement billing UI beyond auth/data dependencies.
- Do not revert work from other branches or worktrees.

## Coordination Notes

- Coordinate with Billing Agent before changing subscription-related schema.
- Coordinate with Super Admin Backend Agent before changing admin settings schema.
- Coordinate with Invitation Flow Agent before changing public guest access rules.

## Verification Checklist

- Prisma generate/migration command appropriate for the local setup.
- Authenticated COUPLE can access own resources.
- Authenticated VENDOR can access own vendor resources.
- SUPER_ADMIN can access admin resources.
- Unauthenticated, wrong-role, and wrong-owner requests are blocked.

## Exit Gate

Protected APIs reject unauthenticated, wrong-role, and wrong-owner access.

## Final Report Requirements

- List changed files and migrations.
- Describe new or changed public API behavior.
- Report auth/RBAC verification results.
- Note any compatibility concerns for other lanes.
