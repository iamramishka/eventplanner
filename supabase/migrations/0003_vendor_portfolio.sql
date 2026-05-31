insert into storage.buckets (id, name, public)
values ('vendor-portfolio', 'vendor-portfolio', false)
on conflict (id) do nothing;
