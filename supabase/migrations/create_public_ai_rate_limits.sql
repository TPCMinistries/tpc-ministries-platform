-- Server-side rate limiting for the public Ask Prophet endpoint.
-- The 5-message session cap lives in client-supplied history, so a direct
-- caller can reset it every request; this table is the server-side backstop.
-- Accessed only via the service-role client — no anon/authenticated access.

create table if not exists public.public_ai_rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  count integer not null default 1
);

alter table public.public_ai_rate_limits enable row level security;

revoke all on table public.public_ai_rate_limits from anon, authenticated;

-- Atomically bump the counter for a key and report whether the caller is
-- still within p_max requests per p_window_seconds. Expired windows reset.
create or replace function public.bump_public_ai_rate(
  p_key text,
  p_window_seconds integer,
  p_max integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public_ai_rate_limits as r (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update set
    count = case
      when r.window_start < now() - make_interval(secs => p_window_seconds) then 1
      else r.count + 1
    end,
    window_start = case
      when r.window_start < now() - make_interval(secs => p_window_seconds) then now()
      else r.window_start
    end
  returning count into v_count;

  return v_count <= p_max;
end;
$$;

revoke execute on function public.bump_public_ai_rate(text, integer, integer)
  from public, anon, authenticated;
