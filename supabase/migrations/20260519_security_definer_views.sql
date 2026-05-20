-- Plug a P0 leak: kenya_trip_participant_status (SECURITY DEFINER view) was
-- granted SELECT to anon AND authenticated, bypassing RLS on the underlying
-- kenya_trip_participants table and exposing email/phone/passport/payment
-- status for every trip participant to anyone with the publishable anon key.
--
-- This migration:
-- 1. Converts all 7 SECURITY DEFINER views to SECURITY INVOKER so they respect
--    the caller's RLS, not the view-creator's superuser privileges.
-- 2. Revokes all client-role grants on the 5 unused/sensitive views.
-- 3. Keeps anon SELECT on the 2 views that the public site actually queries
--    (kenya_supply_pledge_stats, kenya_trip_fundraising_public) — those views
--    already filter to safe rows in their WHERE clause.
--
-- App usage audited 2026-05-19 via repo-wide grep.

------------------------------------------------------------
-- 1. Convert to SECURITY INVOKER
------------------------------------------------------------
alter view public.kenya_trip_participant_status set (security_invoker = true);
alter view public.user_activity_stats             set (security_invoker = true);
alter view public.kenya_fundraising_public        set (security_invoker = true);
alter view public.kenya_sponsorship_stats         set (security_invoker = true);
alter view public.kenya_supply_fund_stats         set (security_invoker = true);
alter view public.kenya_trip_fundraising_public   set (security_invoker = true);
alter view public.kenya_supply_pledge_stats       set (security_invoker = true);

------------------------------------------------------------
-- 2. Lock the 5 unused/sensitive views to service_role + postgres only
------------------------------------------------------------
revoke all on public.kenya_trip_participant_status from anon, authenticated;
revoke all on public.user_activity_stats             from anon, authenticated;
revoke all on public.kenya_fundraising_public        from anon, authenticated;
revoke all on public.kenya_sponsorship_stats         from anon, authenticated;
revoke all on public.kenya_supply_fund_stats         from anon, authenticated;

------------------------------------------------------------
-- 3. Tighten the 2 in-use public views to SELECT-only (revoke
--    INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER on views — nonsensical
--    but the default grants included them).
------------------------------------------------------------
revoke insert, update, delete, truncate, references, trigger
  on public.kenya_supply_pledge_stats from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.kenya_trip_fundraising_public from anon, authenticated;

-- Ensure SELECT is still granted (revoke all + grant select pattern keeps it
-- explicit and idempotent).
grant select on public.kenya_supply_pledge_stats     to anon, authenticated;
grant select on public.kenya_trip_fundraising_public to anon, authenticated;
