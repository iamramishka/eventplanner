# Production Rollout

This project is designed to run on free-tier services with:
- Vercel Hobby for hosting
- Supabase for auth, database, and storage
- GitHub Actions for hourly trial lifecycle scheduling

## 1. Required Vercel Environment Variables

Set these in the Vercel project for the `Production` environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN`
- optional rate-limit overrides:
  - `RATE_LIMIT_LOGIN_MAX`
  - `RATE_LIMIT_LOGIN_WINDOW_MS`
  - `RATE_LIMIT_REGISTER_MAX`
  - `RATE_LIMIT_REGISTER_WINDOW_MS`
  - `RATE_LIMIT_RSVP_MAX`
  - `RATE_LIMIT_RSVP_WINDOW_MS`
  - `RATE_LIMIT_TABLE_MAX`
  - `RATE_LIMIT_TABLE_WINDOW_MS`
  - `RATE_LIMIT_UPLOAD_MAX`
  - `RATE_LIMIT_UPLOAD_WINDOW_MS`
  - `RATE_LIMIT_ADMIN_MUTATION_MAX`
  - `RATE_LIMIT_ADMIN_MUTATION_WINDOW_MS`

## 2. Required GitHub Secrets

Set these repository secrets for the hourly lifecycle workflow:

- `PRODUCTION_BASE_URL`
- `CRON_SECRET`

Use the production deployment URL for `PRODUCTION_BASE_URL`, for example:
- `https://your-project.vercel.app`

## 3. Supabase Migration Order

Apply these SQL migrations in order:

1. `supabase/migrations/0001_lean_mvp.sql`
2. `supabase/migrations/0002_couple_planning.sql`
3. `supabase/migrations/0003_vendor_portfolio.sql`
4. `supabase/migrations/0004_super_admin.sql`
5. `supabase/migrations/0005_production_hardening.sql`

## 4. Storage Buckets

Verify these buckets exist and are usable in the live project:

- `wedding-gallery`
- `vendor-portfolio`

## 5. Super Admin Seeding

Seed one real super admin user in Supabase Auth and ensure a matching `profiles` row exists with:

- `role = 'super_admin'`
- `status = 'active'`

Then verify login at `/admin/login`.

## 6. Trial Lifecycle Scheduling

The repo does not use Vercel cron because hourly cron requires a paid Vercel plan.

Instead:
- `.github/workflows/trial-lifecycle.yml` runs hourly
- it calls:
  - `/api/internal/cron/trials/expire`
  - `/api/internal/cron/trials/grace`
  - `/api/internal/cron/trials/cleanup`
- every request must include `Authorization: Bearer ${CRON_SECRET}`

## 7. Final Production Checks

Run these before launch:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run test:e2e`

Then verify in production:

- couple signup -> onboarding -> dashboard
- guest invitation -> RSVP -> RSVP update
- vendor signup -> profile -> gallery -> services -> submit for review
- admin login -> manage couples and vendors
- locked invitation state after lifecycle changes
