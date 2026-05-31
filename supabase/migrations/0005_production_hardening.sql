create table if not exists public.request_rate_limits (
  scope text not null,
  key text not null,
  count integer not null default 1,
  window_start timestamptz not null,
  expires_at timestamptz not null,
  primary key (scope, key)
);

create index if not exists request_rate_limits_expires_at_idx
  on public.request_rate_limits (expires_at);

create index if not exists request_rate_limits_scope_idx
  on public.request_rate_limits (scope);
