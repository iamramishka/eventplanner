# AGENT_TASK.md - QA Automation Agent

## Branch And Worktree

- Branch: `codex/qa-smoke-browser`
- Worktree: `C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-10-qa-automation`
- Base branch: `dev`
- Production app: `web-app`

## Agent Role

QA Automation Agent.

## Skills

- QA/Release
- Flow Testing
- Image Comparing

## Mission

Create repeatable QA automation and Browser verification so the project has clear pass/fail signals.

## Primary Responsibilities

- Stabilize the smoke runner.
- Use explicit ports and avoid duplicate dev server assumptions.
- Add a repeatable command for smoke/regression checks.
- Add Browser screenshot capture guidance or automation for key pages.
- Cover public, auth, couple, vendor, super admin, billing, RSVP, table finder, and invitation flows.
- Produce clear QA output that can be used by release docs.

## Ownership Boundaries

You may touch QA scripts, test harnesses, docs for test commands, and lightweight test fixtures.

## Do Not Touch

- Do not implement feature behavior except test harness support.
- Do not rewrite app architecture.
- Do not change production UI except to add stable test hooks when necessary.
- Do not revert work from other branches or worktrees.

## Coordination Notes

- Coordinate with feature agents for stable selectors and routes.
- Coordinate with Security Reviewer for auth/privacy test cases.
- Coordinate with Docs/Release Agent for final QA evidence.

## Verification Checklist

- One command runs the main smoke/regression suite.
- Tests use explicit base URL or port.
- Failure output clearly identifies the failed flow.
- Browser screenshots cover desktop and mobile for key surfaces.
- QA docs explain how to rerun checks.

## Exit Gate

One repeatable QA command produces clear pass/fail output.

## Final Report Requirements

- List changed files.
- Provide exact QA commands.
- Report sample output or expected output shape.
- List flows covered and not covered.
