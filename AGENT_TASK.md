# AGENT_TASK.md - Public Site UI Agent

## Branch And Worktree

- Branch: `codex/public-site-design-align`
- Worktree: `C:\Users\ramis\Downloads\wed-plan-worktrees\wed-plan-wt-04-public-site`
- Base branch: `dev`
- Production app: `web-app`

## Agent Role

Public Site UI Agent.

## Skills

- UI/UX Alignment
- Image Comparing
- Logo & Branding Placement

## Mission

Align public landing, auth, signup, and find-event experiences with the `Public Website` design references.

## Primary Responsibilities

- Align landing page to `Public Website/Public Website.png`.
- Align login page to `Public Website/Sign in.png`.
- Align signup step 1 to `Public Website/Sign up Step 1.png`.
- Align signup step 2 to `Public Website/Sign up step 2.png`.
- Align find-event page with the public-site visual language.
- Ensure assets are served from valid `web-app/public` paths.
- Preserve responsive behavior across desktop and mobile.
- Keep form states accessible and usable.

## Ownership Boundaries

You may touch public-site pages, auth/signup presentation, public CSS/modules, image placement, and visual assets needed by these pages.

## Do Not Touch

- Do not change auth database logic.
- Do not change billing internals.
- Do not implement Super Admin CMS persistence.
- Do not revert work from other branches or worktrees.

## Coordination Notes

- Coordinate with Design System Agent for WedPlan/WedInvite and logo decisions.
- Coordinate with Data/Auth Agent before changing form submit contracts.
- Coordinate with QA Automation Agent for screenshot breakpoints.

## Verification Checklist

- Desktop landing screenshot compared to design reference.
- Mobile landing screenshot checked for layout and text fit.
- Login screenshot compared to design reference.
- Signup step 1 and step 2 screenshots checked.
- Find-event flow still navigates correctly.

## Exit Gate

Desktop/mobile screenshots match the public/auth references closely enough for implementation review.

## Final Report Requirements

- List changed files and assets.
- Include screenshot paths or descriptions.
- Note any intentional deviations from mockups.
- Report responsive checks.
