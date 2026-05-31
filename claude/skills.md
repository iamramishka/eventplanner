# Skills

Skills define the areas of expertise each agent must apply. Multiple agents can share skills.

## Skill Index

| Skill | Used By Agents |
|---|---|
| GitHub Ethics | 01, 12 |
| Software Engineering Ethics | 11 |
| Error Fixing | 01 |
| API Handling | 01, 02, 03, 06, 08 |
| Database & Migration | 02 |
| Feature Comparing | 05, 06, 12 |
| Image Comparing | 04, 09, 10 |
| UI/UX Alignment | 04, 05, 06, 07, 09 |
| Logo & Branding | 09 |
| Super Admin Full Control | 03 |
| Flow Testing | 05, 07, 10 |
| QA/Release | 01, 08, 10, 12 |
| Billing/Pricing | 08 |
| Security Review | 02, 03, 11 |

---

## Skill Definitions

### GitHub Ethics
- Protect user work — never destructively overwrite committed code
- Avoid `--force` push to shared branches
- Keep branches isolated to their lane scope
- Write clear, conventional commit messages (`feat:`, `fix:`, `docs:`, etc.)
- Never merge without a passing build gate

### Software Engineering Ethics
- Secure defaults: auth + validation on all inputs
- Privacy for guest and vendor data — no leaks in public endpoints
- Honest QA status — do not mark tasks complete if tests fail
- No fake "production-ready" claims without evidence

### Error Fixing
- Identify root cause before fixing (don't patch symptoms)
- Fix broken import paths (`@/` aliases, relative paths)
- Fix Next.js 15+ client/server component boundaries (`'use client'` placement)
- Fix duplicate `middleware.ts` or `proxy.ts` files
- Fix stale smoke script port assumptions (use explicit `BASE_URL`)
- Document lint debt if full cleanup is out of scope

### API Handling
- Every route: verify session → check role → check ownership
- Consistent response shape: `{ data, error, status }`
- Structured error responses with appropriate HTTP status codes
- Never expose internal stack traces in API responses
- Validate all inputs at the boundary (not just in the UI)

### Database & Migration
- Schema changes only via `prisma migrate dev` (dev) or `prisma migrate deploy` (prod)
- Never edit migration files after they have been applied
- Seed data in `web-app/prisma/seed.js` — idempotent
- SQLite (`dev_sqlite.db`) for local dev only — Postgres for production
- Coordinate schema changes with all lanes that touch affected tables

### Feature Comparing
- Read `plan.md` for sprint acceptance criteria
- Read `coupleadmin.md` / `invitation.md` / relevant spec docs for product requirements
- Map every acceptance criterion to implementation evidence
- Flag missing features or gaps before marking a task complete

### Image Comparing
- Compare browser screenshots against mockup PNGs in design folders
- Verify spacing, typography scale, color tokens, and layout density
- Mobile breakpoints: 375px, 768px | Desktop: 1440px
- Use `rename_map.csv` for asset name mappings if needed

### UI/UX Alignment
- Use design tokens from `web-app/src/lib/design-tokens.css` — never raw hex
- All pages: loading state, empty state, error state
- Forms: validation states, accessible labels, keyboard navigation
- Responsive: mobile-first, test at 375px and 1440px
- No "Coming Soon" placeholders without an issue logged in `claude/todo.md`

### Logo & Branding
- Brand name: **WedPlan** everywhere (check all page titles, meta, auth copy)
- Main logo: used in public header, auth pages, email templates
- Sidebar logo: compact version for dashboard sidebars
- Favicon: update `web-app/public/favicon.ico`
- Design tokens define rose/champagne gold/sage green palette — enforce across all surfaces

### Super Admin Full Control
- Logo and contact number editing (persisted, not hardcoded)
- Plans and pricing editor (Stripe product sync)
- Public CMS blocks (homepage content, testimonials, templates)
- Couple and vendor management (suspend, delete, audit)
- Audit log viewer (`web-app/logs/audit.log`)
- Platform settings (maintenance mode, feature flags, notification settings)

### Flow Testing
- Public invitation: load `/invitation/[slug]`, valid slug renders, invalid 404s
- RSVP: token-based submission, update, decline, invalid token rejection
- Table finder: guest lookup works only after verification
- Auth: login, role-based routing, unauthenticated redirect
- Couple dashboard: all major modules accessible after login
- Vendor portal: onboarding, listing, booking flows accessible
- Super Admin: KPI cards, couple list, vendor approvals accessible

### QA/Release
- `npm run build` from `web-app/` must pass before release
- `npm run lint` — fix or document remaining debt
- Smoke tests: `npm run test:*` scripts under `web-app/scripts/`
- Browser QA: screenshot at 375px (mobile) and 1440px (desktop)
- Release checklist in `claude/github.md`
- Production-like Postgres check before final release

### Billing/Pricing
- Stripe test mode — never use real payment credentials in dev
- Webhook handling for `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`
- Plan tiers: Free, Pro, Premium (editable via Super Admin)
- Entitlement enforcement: check plan before serving gated features
- Billing docs: document sandbox setup and webhook configuration

### Security Review
- Authentication: every protected route checks session
- Authorization: role + ownership check — couples can't access other couples' data
- Guest privacy: RSVPs and guest names are not publicly exposed
- Upload security: validate MIME type, max file size, reject executable content
- Secrets: no API keys, passwords, or tokens in committed code
- Audit log: all destructive Super Admin actions logged with actor, timestamp, action
- OWASP Top 10: no SQL injection (Prisma parameterizes), no XSS (React escapes), no CSRF (Next.js SameSite)
