alter table public.weddings
add column if not exists intro_message text not null default '';

insert into storage.buckets (id, name, public)
values ('wedding-gallery', 'wedding-gallery', false)
on conflict (id) do nothing;
