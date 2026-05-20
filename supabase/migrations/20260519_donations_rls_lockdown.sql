-- Lock down donations RLS. Pre-state: RLS disabled, so anon key could read or
-- mutate every row. Server routes use service role (bypass RLS), so they're
-- unaffected. The only client-side read is /my-giving, scoped to the current
-- member. See .planning/AUDIT-2026-05-19.md + Supabase advisory rls_disabled.

alter table public.donations enable row level security;

drop policy if exists donations_select_own on public.donations;
create policy donations_select_own
  on public.donations for select
  to authenticated
  using (
    member_id in (select id from public.members where user_id = auth.uid())
  );

drop policy if exists donations_select_admin on public.donations;
create policy donations_select_admin
  on public.donations for select
  to authenticated
  using (
    exists (select 1 from public.members m
            where m.user_id = auth.uid()
              and m.role in ('admin', 'owner'))
  );

drop policy if exists donations_admin_all on public.donations;
create policy donations_admin_all
  on public.donations for all
  to authenticated
  using (
    exists (select 1 from public.members m
            where m.user_id = auth.uid()
              and m.role in ('admin', 'owner'))
  )
  with check (
    exists (select 1 from public.members m
            where m.user_id = auth.uid()
              and m.role in ('admin', 'owner'))
  );

-- No INSERT/UPDATE/DELETE policy for anon — webhooks use service role.
