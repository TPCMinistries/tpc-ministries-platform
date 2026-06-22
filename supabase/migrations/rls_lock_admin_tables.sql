-- Phase 10 · Plan 10-01 — Lock admin/service-role-only tables
-- Date: 2026-06-20
--
-- Removes public `USING(true)` ("Service role full access") RLS policies that were
-- written `TO public`, which let anon + any authenticated user read/write these
-- tables. The service role bypasses RLS, so the admin client (createAdminClient,
-- lib/supabase/admin.ts) keeps working after these drops. Verified: every app
-- read of these tables goes through the admin client; no authenticated/anon
-- browser read path exists.
--
-- Tables that retain an is_tpc_admin() ALL policy keep admin-via-browser access.
-- search_logs + workflow_executions are intentionally NOT touched (already correct:
-- INSERT-public + admin-scoped SELECT). scheduled_notifications + pastoral_care_notes
-- are already no-policy (service-role-only).

BEGIN;

-- Kenya financial (admin client only; admin_payments + mission_funds keep is_tpc_admin())
DROP POLICY IF EXISTS "Service role full access on admin_payments" ON public.kenya_trip_admin_payments;
DROP POLICY IF EXISTS "Service role full access"                   ON public.kenya_trip_mission_funds;
DROP POLICY IF EXISTS "Service role full access on proposals"      ON public.kenya_trip_partner_proposals;
DROP POLICY IF EXISTS "Service role full access on partners"       ON public.kenya_trip_partners;

-- Kenya track-lead CRM (admin client only)
DROP POLICY IF EXISTS "Service role full access on track_lead_notes" ON public.kenya_trip_track_lead_notes;
DROP POLICY IF EXISTS "Service role full access on track_plans"      ON public.kenya_trip_track_plans;

-- Ops/system (admin client only)
DROP POLICY IF EXISTS "Service role can manage message queue"   ON public.message_queue;
DROP POLICY IF EXISTS "Service role full access to workspaces"        ON public.workspaces;
DROP POLICY IF EXISTS "Service role full access to workspace_members" ON public.workspace_members;
DROP POLICY IF EXISTS "Service role full access to workspace_invites" ON public.workspace_invites;

COMMIT;

-- ============================================================================
-- ROLLBACK (run this block to fully restore the prior state)
-- ============================================================================
-- BEGIN;
-- CREATE POLICY "Service role full access on admin_payments" ON public.kenya_trip_admin_payments FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Service role full access"                   ON public.kenya_trip_mission_funds   FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Service role full access on proposals"      ON public.kenya_trip_partner_proposals FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Service role full access on partners"       ON public.kenya_trip_partners        FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Service role full access on track_lead_notes" ON public.kenya_trip_track_lead_notes FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Service role full access on track_plans"      ON public.kenya_trip_track_plans     FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Service role can manage message queue"   ON public.message_queue     FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Service role full access to workspaces"        ON public.workspaces        FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Service role full access to workspace_members" ON public.workspace_members FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Service role full access to workspace_invites" ON public.workspace_invites FOR ALL USING (true) WITH CHECK (true);
-- COMMIT;
