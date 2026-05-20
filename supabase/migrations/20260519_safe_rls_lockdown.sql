-- Enable RLS on 4 lower-risk tables flagged by Supabase advisory rls_disabled.
-- These either contain config/reference data (public read) or member-scoped
-- data with clear ownership (own-row read+write). See audit + advisory.

------------------------------------------------------------
-- admin_notes — admin-only
------------------------------------------------------------
alter table public.admin_notes enable row level security;

drop policy if exists admin_notes_admin_all on public.admin_notes;
create policy admin_notes_admin_all
  on public.admin_notes for all
  to authenticated
  using (
    exists (select 1 from public.members m
            where m.user_id = auth.uid() and m.role in ('admin','owner'))
  )
  with check (
    exists (select 1 from public.members m
            where m.user_id = auth.uid() and m.role in ('admin','owner'))
  );

------------------------------------------------------------
-- membership_tiers — public-readable reference (currently empty, but the
-- /api/members/tier route reads it server-side via service role anyway)
------------------------------------------------------------
alter table public.membership_tiers enable row level security;

drop policy if exists membership_tiers_select_public on public.membership_tiers;
create policy membership_tiers_select_public
  on public.membership_tiers for select
  to anon, authenticated
  using (true);

drop policy if exists membership_tiers_admin_all on public.membership_tiers;
create policy membership_tiers_admin_all
  on public.membership_tiers for all
  to authenticated
  using (
    exists (select 1 from public.members m
            where m.user_id = auth.uid() and m.role in ('admin','owner'))
  )
  with check (
    exists (select 1 from public.members m
            where m.user_id = auth.uid() and m.role in ('admin','owner'))
  );

------------------------------------------------------------
-- seasons — public reference data (member pages SELECT this)
------------------------------------------------------------
alter table public.seasons enable row level security;

drop policy if exists seasons_select_public on public.seasons;
create policy seasons_select_public
  on public.seasons for select
  to anon, authenticated
  using (true);

drop policy if exists seasons_admin_all on public.seasons;
create policy seasons_admin_all
  on public.seasons for all
  to authenticated
  using (
    exists (select 1 from public.members m
            where m.user_id = auth.uid() and m.role in ('admin','owner'))
  )
  with check (
    exists (select 1 from public.members m
            where m.user_id = auth.uid() and m.role in ('admin','owner'))
  );

------------------------------------------------------------
-- member_seasons — member's own only (read + write)
------------------------------------------------------------
alter table public.member_seasons enable row level security;

drop policy if exists member_seasons_own on public.member_seasons;
create policy member_seasons_own
  on public.member_seasons for all
  to authenticated
  using (
    member_id in (select id from public.members where user_id = auth.uid())
  )
  with check (
    member_id in (select id from public.members where user_id = auth.uid())
  );

drop policy if exists member_seasons_admin_all on public.member_seasons;
create policy member_seasons_admin_all
  on public.member_seasons for all
  to authenticated
  using (
    exists (select 1 from public.members m
            where m.user_id = auth.uid() and m.role in ('admin','owner'))
  )
  with check (
    exists (select 1 from public.members m
            where m.user_id = auth.uid() and m.role in ('admin','owner'))
  );
