create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('couple', 'vendor', 'super_admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type public.subscription_status as enum ('trial', 'active', 'expired', 'grace', 'suspended');
  end if;
  if not exists (select 1 from pg_type where typname = 'guest_side') then
    create type public.guest_side as enum ('Bride', 'Groom');
  end if;
  if not exists (select 1 from pg_type where typname = 'invitation_type') then
    create type public.invitation_type as enum ('Individual', 'Family');
  end if;
  if not exists (select 1 from pg_type where typname = 'rsvp_status') then
    create type public.rsvp_status as enum ('pending', 'confirmed', 'declined');
  end if;
  if not exists (select 1 from pg_type where typname = 'meal_preference') then
    create type public.meal_preference as enum ('Standard', 'Vegetarian', 'Vegan', 'Halal');
  end if;
  if not exists (select 1 from pg_type where typname = 'liquor_preference') then
    create type public.liquor_preference as enum ('Yes', 'No', 'Undecided');
  end if;
  if not exists (select 1 from pg_type where typname = 'rsvp_source') then
    create type public.rsvp_source as enum ('guest', 'couple');
  end if;
  if not exists (select 1 from pg_type where typname = 'gallery_image_type') then
    create type public.gallery_image_type as enum ('hero', 'story', 'gallery');
  end if;
  if not exists (select 1 from pg_type where typname = 'budget_status') then
    create type public.budget_status as enum ('planned', 'booked', 'paid');
  end if;
  if not exists (select 1 from pg_type where typname = 'task_priority') then
    create type public.task_priority as enum ('Low', 'Medium', 'High');
  end if;
  if not exists (select 1 from pg_type where typname = 'wedding_vendor_status') then
    create type public.wedding_vendor_status as enum ('Shortlisted', 'Contacted', 'Booked');
  end if;
  if not exists (select 1 from pg_type where typname = 'vendor_status') then
    create type public.vendor_status as enum ('draft', 'pending', 'approved', 'rejected', 'blocked');
  end if;
  if not exists (select 1 from pg_type where typname = 'cms_status') then
    create type public.cms_status as enum ('draft', 'published');
  end if;
  if not exists (select 1 from pg_type where typname = 'support_status') then
    create type public.support_status as enum ('open', 'resolved');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'couple',
  full_name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.weddings (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references public.profiles(id) on delete cascade,
  slug text not null unique,
  partner_one_name text not null default '',
  partner_two_name text not null default '',
  wedding_title text not null default 'Our Wedding Celebration',
  event_date timestamptz null,
  date_tbd boolean not null default false,
  venue_name text not null default '',
  venue_tbd boolean not null default false,
  venue_map_link text not null default '',
  timezone text not null default 'Asia/Colombo',
  contact_phone text not null default '',
  rsvp_deadline timestamptz null,
  estimated_guests integer null,
  estimated_budget numeric(12,2) null,
  setup_completed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  guest_limit integer not null default 200,
  gallery_limit integer not null default 8,
  features jsonb not null default '[]'::jsonb,
  is_trial boolean not null default false,
  active boolean not null default true
);

create table if not exists public.wedding_subscriptions (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null unique references public.weddings(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status public.subscription_status not null default 'trial',
  trial_ends_at timestamptz null,
  grace_ends_at timestamptz null,
  renewal_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  name text not null,
  side public.guest_side not null,
  whatsapp_country_code text not null default '+94',
  whatsapp_number text not null,
  email text null,
  invitation_type public.invitation_type not null,
  max_allowed_members integer not null default 1,
  notes text not null default '',
  last_invite_sent_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.guest_invites (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null unique references public.guests(id) on delete cascade,
  invite_token text not null unique,
  is_active boolean not null default true,
  sent_at timestamptz null,
  last_opened_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.rsvp_responses (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.guests(id) on delete cascade,
  status public.rsvp_status not null,
  attending_count integer not null default 0,
  meal_preference public.meal_preference not null default 'Standard',
  liquor_preference public.liquor_preference not null default 'Undecided',
  special_note text not null default '',
  source public.rsvp_source not null default 'guest',
  submitted_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invitation_sites (
  wedding_id uuid primary key references public.weddings(id) on delete cascade,
  theme_preset text not null default 'blush-bloom',
  primary_color text not null default '#C45A74',
  secondary_color text not null default '#D8B48A',
  accent_color text not null default '#8FA98F',
  surface_color text not null default '#FFFDFC',
  visibility jsonb not null default '[]'::jsonb,
  music_enabled boolean not null default false,
  music_muted_by_default boolean not null default true,
  music_track_id text null,
  is_published boolean not null default false,
  has_unpublished_changes boolean not null default false,
  last_draft_saved_at timestamptz null,
  last_published_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invitation_content_blocks (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  block_key text not null,
  title text not null default '',
  body text not null default '',
  sort_order integer not null default 0
);

create table if not exists public.gallery_assets (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  name text not null,
  image_type public.gallery_image_type not null,
  image_path text not null,
  is_cover boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.agenda_items (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  title text not null,
  event_time text not null,
  duration_minutes integer not null default 0,
  description text not null default '',
  icon_key text not null default 'sparkles',
  sort_order integer not null default 0
);

create table if not exists public.wedding_tables (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  table_name text not null,
  capacity integer not null default 1,
  sort_order integer not null default 0
);

create table if not exists public.wedding_table_assignments (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.wedding_tables(id) on delete cascade,
  guest_id uuid not null unique references public.guests(id) on delete cascade,
  assigned_count integer not null default 1
);

create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  category text not null,
  title text not null,
  estimated_amount numeric(12,2) not null default 0,
  actual_amount numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  note text not null default '',
  due_date date null,
  status public.budget_status not null default 'planned'
);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  group_name text not null,
  title text not null,
  description text not null default '',
  due_date date null,
  priority public.task_priority not null default 'Medium',
  is_completed boolean not null default false
);

create table if not exists public.wedding_vendors (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  name text not null,
  category text not null,
  phone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  note text not null default '',
  status public.wedding_vendor_status not null default 'Shortlisted',
  linked_budget_item_id uuid null references public.budget_items(id) on delete set null
);

create table if not exists public.vendor_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  business_name text not null,
  category text not null default 'Other',
  tagline text not null default '',
  description text not null default '',
  location text not null default '',
  coverage_area text not null default '',
  experience_years integer not null default 0,
  price_range text not null default '',
  phone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  website text not null default '',
  instagram text not null default '',
  facebook text not null default '',
  map_link text not null default '',
  status public.vendor_status not null default 'draft',
  is_public boolean not null default false,
  can_be_public boolean not null default false,
  featured_by_admin boolean not null default false,
  admin_message text not null default '',
  rejected_reason text null,
  last_submitted_at timestamptz null,
  approved_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.vendor_gallery_assets (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendor_profiles(user_id) on delete cascade,
  image_path text not null,
  alt_text text not null default '',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  uploaded_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.vendor_services (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendor_profiles(user_id) on delete cascade,
  title text not null,
  description text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.vendor_service_packages (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.vendor_services(id) on delete cascade,
  package_name text not null,
  description text not null default '',
  price_note text not null default '',
  inclusions jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  target_type text not null,
  target_id uuid null,
  reason text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  status public.cms_status not null default 'draft',
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.support_inquiries (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status public.support_status not null default 'open',
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_weddings_slug on public.weddings(slug);
create unique index if not exists idx_plans_code on public.plans(code);
create unique index if not exists idx_guest_invites_token on public.guest_invites(invite_token);
create index if not exists idx_guests_wedding_id on public.guests(wedding_id);
create index if not exists idx_rsvp_guest_time on public.rsvp_responses(guest_id, submitted_at desc);
create index if not exists idx_gallery_assets_wedding_order on public.gallery_assets(wedding_id, sort_order);
create index if not exists idx_vendor_gallery_vendor_order on public.vendor_gallery_assets(vendor_id, sort_order);

create or replace view public.guest_rsvp_current_v as
select distinct on (r.guest_id)
  r.guest_id,
  r.status,
  r.attending_count,
  r.meal_preference,
  r.liquor_preference,
  r.special_note,
  r.source,
  r.submitted_at
from public.rsvp_responses r
order by r.guest_id, r.submitted_at desc, r.id desc;

create or replace function public.is_super_admin(user_uuid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_uuid and role = 'super_admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.weddings enable row level security;
alter table public.wedding_subscriptions enable row level security;
alter table public.guests enable row level security;
alter table public.guest_invites enable row level security;
alter table public.rsvp_responses enable row level security;
alter table public.invitation_sites enable row level security;
alter table public.invitation_content_blocks enable row level security;
alter table public.gallery_assets enable row level security;
alter table public.agenda_items enable row level security;
alter table public.wedding_tables enable row level security;
alter table public.wedding_table_assignments enable row level security;
alter table public.budget_items enable row level security;
alter table public.checklist_items enable row level security;
alter table public.wedding_vendors enable row level security;
alter table public.vendor_profiles enable row level security;
alter table public.vendor_gallery_assets enable row level security;
alter table public.vendor_services enable row level security;
alter table public.vendor_service_packages enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.cms_pages enable row level security;
alter table public.support_inquiries enable row level security;

create policy "profiles self read" on public.profiles
for select using (auth.uid() = id or public.is_super_admin(auth.uid()));

create policy "profiles self upsert" on public.profiles
for insert with check (auth.uid() = id);

create policy "profiles self update" on public.profiles
for update using (auth.uid() = id or public.is_super_admin(auth.uid()))
with check (auth.uid() = id or public.is_super_admin(auth.uid()));

create policy "weddings owner read" on public.weddings
for select using (owner_user_id = auth.uid() or public.is_super_admin(auth.uid()));

create policy "weddings owner write" on public.weddings
for insert with check (owner_user_id = auth.uid() or public.is_super_admin(auth.uid()));

create policy "weddings owner update" on public.weddings
for update using (owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
with check (owner_user_id = auth.uid() or public.is_super_admin(auth.uid()));

create policy "wedding subscriptions readable by owner" on public.wedding_subscriptions
for select using (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
);

create policy "wedding subscriptions writable by owner" on public.wedding_subscriptions
for insert with check (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
);

create policy "wedding subscriptions update by owner" on public.wedding_subscriptions
for update using (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
)
with check (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
);

create policy "guests owner access" on public.guests
for all using (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
)
with check (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
);

create policy "guest invites owner access" on public.guest_invites
for all using (
  exists (
    select 1
    from public.guests g
    join public.weddings w on w.id = g.wedding_id
    where g.id = guest_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
)
with check (
  exists (
    select 1
    from public.guests g
    join public.weddings w on w.id = g.wedding_id
    where g.id = guest_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
);

create policy "rsvp owner access" on public.rsvp_responses
for all using (
  exists (
    select 1
    from public.guests g
    join public.weddings w on w.id = g.wedding_id
    where g.id = guest_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
)
with check (
  exists (
    select 1
    from public.guests g
    join public.weddings w on w.id = g.wedding_id
    where g.id = guest_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
);

create policy "invitation sites owner access" on public.invitation_sites
for all using (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
)
with check (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
);

create policy "invitation content owner access" on public.invitation_content_blocks
for all using (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
)
with check (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
);

create policy "gallery owner access" on public.gallery_assets
for all using (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
)
with check (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
);

create policy "agenda owner access" on public.agenda_items
for all using (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
)
with check (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
);

create policy "wedding tables owner access" on public.wedding_tables
for all using (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
)
with check (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
);

create policy "table assignments owner access" on public.wedding_table_assignments
for all using (
  exists (
    select 1
    from public.wedding_tables t
    join public.weddings w on w.id = t.wedding_id
    where t.id = table_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
)
with check (
  exists (
    select 1
    from public.wedding_tables t
    join public.weddings w on w.id = t.wedding_id
    where t.id = table_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
);

create policy "budget owner access" on public.budget_items
for all using (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
)
with check (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
);

create policy "checklist owner access" on public.checklist_items
for all using (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
)
with check (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
);

create policy "wedding vendors owner access" on public.wedding_vendors
for all using (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
)
with check (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (w.owner_user_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
);

create policy "vendor profiles self access" on public.vendor_profiles
for all using (user_id = auth.uid() or public.is_super_admin(auth.uid()))
with check (user_id = auth.uid() or public.is_super_admin(auth.uid()));

create policy "vendor gallery self access" on public.vendor_gallery_assets
for all using (vendor_id = auth.uid() or public.is_super_admin(auth.uid()))
with check (vendor_id = auth.uid() or public.is_super_admin(auth.uid()));

create policy "vendor services self access" on public.vendor_services
for all using (vendor_id = auth.uid() or public.is_super_admin(auth.uid()))
with check (vendor_id = auth.uid() or public.is_super_admin(auth.uid()));

create policy "vendor package self access" on public.vendor_service_packages
for all using (
  exists (
    select 1 from public.vendor_services s
    where s.id = service_id and (s.vendor_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
)
with check (
  exists (
    select 1 from public.vendor_services s
    where s.id = service_id and (s.vendor_id = auth.uid() or public.is_super_admin(auth.uid()))
  )
);

create policy "admin audit admin access" on public.admin_audit_logs
for all using (public.is_super_admin(auth.uid()))
with check (public.is_super_admin(auth.uid()));

create policy "cms admin access" on public.cms_pages
for all using (public.is_super_admin(auth.uid()))
with check (public.is_super_admin(auth.uid()));

create policy "support inquiry create" on public.support_inquiries
for insert with check (true);

create policy "support admin read/update" on public.support_inquiries
for select using (public.is_super_admin(auth.uid()));

create policy "support admin update" on public.support_inquiries
for update using (public.is_super_admin(auth.uid()))
with check (public.is_super_admin(auth.uid()));

insert into public.plans (code, name, guest_limit, gallery_limit, features, is_trial, active)
values (
  'trial',
  'Free Trial',
  200,
  8,
  '["Guest management", "RSVP tracking", "Basic invitation editing"]'::jsonb,
  true,
  true
)
on conflict (code) do nothing;
