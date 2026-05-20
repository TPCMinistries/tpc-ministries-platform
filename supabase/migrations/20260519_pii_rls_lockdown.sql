-- Lock down the 4 remaining tables flagged by Supabase advisory rls_disabled.
-- prayer_responses, prayer_supporters, and documents are unused in current app
-- code (verified via repo-wide grep on 2026-05-19) — admin-only is the safe
-- defensive policy. prophecies has a public hub + admin path; we allow public
-- SELECT of published rows and admin-all. Server routes use service role and
-- bypass RLS, so the public landing page + admin dashboard are unaffected.

------------------------------------------------------------
-- prophecies — published SELECT public, admin all
------------------------------------------------------------
alter table public.prophecies enable row level security;

drop policy if exists prophecies_select_published on public.prophecies;
create policy prophecies_select_published
  on public.prophecies for select
  to anon, authenticated
  using (published = true);

drop policy if exists prophecies_admin_all on public.prophecies;
create policy prophecies_admin_all
  on public.prophecies for all
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
-- documents — admin-only (table exists but is unused by app code)
------------------------------------------------------------
alter table public.documents enable row level security;

drop policy if exists documents_admin_all on public.documents;
create policy documents_admin_all
  on public.documents for all
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
-- prayer_responses — admin-only (unused; app uses prayer_interactions)
------------------------------------------------------------
alter table public.prayer_responses enable row level security;

drop policy if exists prayer_responses_admin_all on public.prayer_responses;
create policy prayer_responses_admin_all
  on public.prayer_responses for all
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
-- prayer_supporters — admin-only (unused; app uses prayer_interactions)
------------------------------------------------------------
alter table public.prayer_supporters enable row level security;

drop policy if exists prayer_supporters_admin_all on public.prayer_supporters;
create policy prayer_supporters_admin_all
  on public.prayer_supporters for all
  to authenticated
  using (
    exists (select 1 from public.members m
            where m.user_id = auth.uid() and m.role in ('admin','owner'))
  )
  with check (
    exists (select 1 from public.members m
            where m.user_id = auth.uid() and m.role in ('admin','owner'))
  );
