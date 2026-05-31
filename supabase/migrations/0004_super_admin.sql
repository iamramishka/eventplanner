do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'profile_status'
  ) then
    create type public.profile_status as enum ('active', 'suspended', 'deleted');
  end if;

  if not exists (
    select 1 from pg_type where typname = 'template_status'
  ) then
    create type public.template_status as enum ('draft', 'active', 'inactive');
  end if;

  if not exists (
    select 1 from pg_type where typname = 'system_setting_type'
  ) then
    create type public.system_setting_type as enum ('text', 'email', 'toggle');
  end if;

  if not exists (
    select 1 from pg_type where typname = 'system_log_level'
  ) then
    create type public.system_log_level as enum ('info', 'warning', 'error');
  end if;
end
$$;

alter table public.profiles
  add column if not exists status public.profile_status not null default 'active';

alter table public.plans
  add column if not exists price_label text not null default '';

alter table public.plans
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

create table if not exists public.invitation_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version text not null,
  status public.template_status not null default 'draft',
  tags jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.system_settings (
  key text primary key,
  label text not null,
  value text not null default '',
  type public.system_setting_type not null default 'text',
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.system_logs (
  id uuid primary key default gen_random_uuid(),
  level public.system_log_level not null default 'info',
  source text not null,
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.invitation_templates enable row level security;
alter table public.system_settings enable row level security;
alter table public.system_logs enable row level security;

drop policy if exists "Super admins can manage invitation templates" on public.invitation_templates;
create policy "Super admins can manage invitation templates"
on public.invitation_templates
for all
using (public.is_super_admin(auth.uid()))
with check (public.is_super_admin(auth.uid()));

drop policy if exists "Super admins can manage system settings" on public.system_settings;
create policy "Super admins can manage system settings"
on public.system_settings
for all
using (public.is_super_admin(auth.uid()))
with check (public.is_super_admin(auth.uid()));

drop policy if exists "Super admins can read system logs" on public.system_logs;
create policy "Super admins can read system logs"
on public.system_logs
for select
using (public.is_super_admin(auth.uid()));

drop policy if exists "Service role can write system logs" on public.system_logs;
create policy "Service role can write system logs"
on public.system_logs
for insert
with check (public.is_super_admin(auth.uid()));

insert into public.plans (id, code, name, guest_limit, gallery_limit, features, is_trial, active, price_label, updated_at)
values
  (gen_random_uuid(), 'trial', 'Free Trial', 120, 20, '["Guest setup", "RSVP basics", "Template previews"]'::jsonb, true, true, 'LKR 0 / 7 days', timezone('utc', now())),
  (gen_random_uuid(), 'basic', 'Basic', 180, 50, '["Invitation site", "Guest management", "Checklist"]'::jsonb, false, true, 'LKR 4,900 / wedding', timezone('utc', now())),
  (gen_random_uuid(), 'premium', 'Premium', 350, 200, '["Everything in Basic", "Budget planner", "Vendor visibility", "Exports"]'::jsonb, false, true, 'LKR 9,900 / wedding', timezone('utc', now()))
on conflict (code) do update
set
  name = excluded.name,
  guest_limit = excluded.guest_limit,
  gallery_limit = excluded.gallery_limit,
  features = excluded.features,
  is_trial = excluded.is_trial,
  active = excluded.active,
  price_label = case
    when public.plans.price_label = '' then excluded.price_label
    else public.plans.price_label
  end,
  updated_at = timezone('utc', now());

insert into public.invitation_templates (name, version, status, tags, updated_at)
values
  ('Classic Gold', '1.3.0', 'active', '["formal", "luxury"]'::jsonb, timezone('utc', now())),
  ('Blush Bloom', '1.2.4', 'active', '["romantic", "soft"]'::jsonb, timezone('utc', now())),
  ('Sage Garden', '0.9.2', 'draft', '["outdoor", "garden"]'::jsonb, timezone('utc', now()))
on conflict do nothing;

insert into public.system_settings (key, label, value, type, updated_at)
values
  ('support_email', 'Support email', 'support@vinyup.com', 'email', timezone('utc', now())),
  ('platform_name', 'Platform name', 'Vinyup Weddings', 'text', timezone('utc', now())),
  ('maintenance_mode', 'Maintenance mode', 'false', 'toggle', timezone('utc', now())),
  ('vendor_auto_feature', 'Auto-feature approved vendors', 'false', 'toggle', timezone('utc', now()))
on conflict (key) do nothing;

insert into public.cms_pages (id, page_key, title, content, status, updated_at)
values
  (gen_random_uuid(), 'home', 'Home Page Hero', '{}'::jsonb, 'published', timezone('utc', now())),
  (gen_random_uuid(), 'pricing', 'Pricing Page Content', '{}'::jsonb, 'published', timezone('utc', now())),
  (gen_random_uuid(), 'vendors', 'Vendor Join Callout', '{}'::jsonb, 'draft', timezone('utc', now()))
on conflict (page_key) do nothing;

insert into public.system_logs (id, level, source, message, created_at)
values
  (gen_random_uuid(), 'error', 'trial-cleanup-worker', 'Cleanup batch skipped 1 record due to retention lock.', timezone('utc', now()) - interval '2 hours'),
  (gen_random_uuid(), 'warning', 'vendor-review-service', 'Vendor profile submitted without secondary contact number.', timezone('utc', now()) - interval '3 hours'),
  (gen_random_uuid(), 'info', 'dashboard-aggregator', 'Daily admin overview snapshot refreshed successfully.', timezone('utc', now()) - interval '4 hours')
on conflict do nothing;
