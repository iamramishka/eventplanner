---
name: add-small-feature
description: Workflow for adding a small feature or making a feature change to the WedPlan web-app during the maintenance phase. Use when the user wants a new field, button, small screen, extra option, copy/content change, or a tweak to an existing flow — anything additive but contained. Keeps changes scoped, consistent with conventions, and verified.
---

# Add a small feature / make a feature change

The product is built and live. Favor **small, contained, consistent** changes over
broad refactors. If a request is actually large, say so and propose splitting it.

## 1. Clarify scope
- Confirm exactly what should change, for which domain (couple / super admin / vendor /
  public invitation) and which role can use it.
- Check the relevant spec for intent: `coupleadmin.md`, `invitation.md`, `superadmin.md`,
  `vendorportal.md`. Match existing patterns rather than inventing new ones.

## 2. Find the seam
- Reuse existing components, stores, and API routes. Search first (`web-app/src/`) before
  creating anything new.
- Reference the UI mockups (read-only PNG folders) for layout/spacing if it's a visual
  change.

## 3. Implement to standards
- **API routes:** verify session → check role → check ownership. Response shape stays
  consistent; no stack traces leaked. Validate inputs at the boundary.
- **DB changes:** avoid if possible. If unavoidable, use `prisma migrate dev` — never hand-
  edit applied migrations. Keep seed data idempotent.
- **UI:** design tokens only (no raw hex), mobile-first, include loading / empty / error
  states and accessible labels. Brand name is **WedPlan**.
- No "Coming Soon" placeholders — either build it or leave it out and note it in
  `claude/todo.md`.

## 4. Verify
- Add or extend a smoke test under `web-app/scripts/` if the feature has logic worth
  guarding, and wire it into `package.json` if appropriate.
- Run `/ship-check` (build + lint + typecheck) and the closest smoke test.
- Exercise the feature manually in `npm run dev` at desktop (1440px) and mobile (375px).

## 5. Commit (only when asked)
- Branch from **`main`**. Conventional commit: `feat(scope): description`.
