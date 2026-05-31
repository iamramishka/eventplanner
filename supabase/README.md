# Supabase Setup

This app now includes a lean MVP Supabase schema and the first real backend slice for shared auth and couple onboarding.

## Apply the schema
1. Open the Supabase SQL editor for your project.
2. Run `supabase/migrations/0001_lean_mvp.sql`.
3. Verify the tables, view, and RLS policies were created.

## Required auth settings
- Enable Email/Password auth.
- For the current MVP flow, disable email confirmation if you want immediate post-signup onboarding.

## Required env vars
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` for future admin/server-only actions

## Current live backend slice
- Shared auth for couple, vendor, and admin sign-in paths
- Couple onboarding -> wedding creation -> invitation seed
- Session and couple bootstrap endpoints

## Current bridge behavior
The unmigrated dashboard modules still keep local compatibility caches. The Supabase-backed auth/onboarding flow hydrates those caches so the existing dashboard keeps working while the rest of the modules are migrated.
