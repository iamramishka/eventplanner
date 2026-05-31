# UI Primitives

This document describes the shared UI primitives (design tokens, buttons, inputs) used across the WedPlan app.

Overview
- Location: `src/components/ui`
- Test page: `/dev/ui-primitives`

Design tokens
- Declared in `src/app/globals.css` as CSS custom properties (variables).
- Key groups: color palettes (`--inv-*`, `--adm-*`), typography (`--font-serif`, `--font-sans`, `--text-*`), spacing (`--space-*`), radii (`--radius-*`), shadows (`--shadow-*`).

Button component (`Button`)
- File: `src/components/ui/Button.tsx`
- Variants: `primary` (default), `outline`, `ghost`.
- CSS classes: `.btn`, `.btn-primary`, `.btn-outline`, `.btn-ghost` (defined in `globals.css`).
- Props: all native `button` props, plus `variant`.

Input component (`Input`)
- File: `src/components/ui/Input.tsx`
- Renders label (optional), input, and error message (optional).
- CSS classes: `.input`, `.input-error` (defined in `globals.css`).
- Props: all native `input` props, plus `label` and `error`.

Usage
1. Import the component:

```tsx
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
```

2. Use in your pages or components:

```tsx
<Button variant="primary">Save</Button>
<Input label="Email" placeholder="you@example.com" />
```

Testing and preview
- Run the dev server and open `http://localhost:3000/dev/ui-primitives` to see the primitives rendered across light and dark surfaces.

Guidelines
- Prefer `Button` and `Input` for consistent spacing and accessibility.
- Keep the primitives unopinionated; implement wrapper components when you need domain-specific behavior (e.g., `PrimaryAction`).
