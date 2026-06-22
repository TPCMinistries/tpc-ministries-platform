-- Phase 10 · Plan 10-02 · Batch 1 — member progress/engagement tables
-- Date: 2026-06-20
--
-- These 4 tables currently have RLS enabled with ZERO policies => only the service
-- role can touch them; the authenticated browser client can read nothing. This
-- migration is PURELY ADDITIVE: it grants each member access to ONLY their own
-- rows. Nothing is dropped, so nothing existing can break. Service role (admin
-- client) continues to bypass RLS.
--
-- Ownership model (see lib/auth-server.ts): members.user_id = auth.uid(),
-- member_id -> members.id. Correct owner check:
--   member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())

BEGIN;

-- teaching_progress
CREATE POLICY "Members read own teaching_progress" ON public.teaching_progress FOR SELECT TO authenticated
  USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));
CREATE POLICY "Members insert own teaching_progress" ON public.teaching_progress FOR INSERT TO authenticated
  WITH CHECK (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));
CREATE POLICY "Members update own teaching_progress" ON public.teaching_progress FOR UPDATE TO authenticated
  USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()))
  WITH CHECK (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));
CREATE POLICY "Members delete own teaching_progress" ON public.teaching_progress FOR DELETE TO authenticated
  USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

-- teaching_bookmarks
CREATE POLICY "Members read own teaching_bookmarks" ON public.teaching_bookmarks FOR SELECT TO authenticated
  USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));
CREATE POLICY "Members insert own teaching_bookmarks" ON public.teaching_bookmarks FOR INSERT TO authenticated
  WITH CHECK (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));
CREATE POLICY "Members update own teaching_bookmarks" ON public.teaching_bookmarks FOR UPDATE TO authenticated
  USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()))
  WITH CHECK (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));
CREATE POLICY "Members delete own teaching_bookmarks" ON public.teaching_bookmarks FOR DELETE TO authenticated
  USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

-- content_progress
CREATE POLICY "Members read own content_progress" ON public.content_progress FOR SELECT TO authenticated
  USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));
CREATE POLICY "Members insert own content_progress" ON public.content_progress FOR INSERT TO authenticated
  WITH CHECK (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));
CREATE POLICY "Members update own content_progress" ON public.content_progress FOR UPDATE TO authenticated
  USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()))
  WITH CHECK (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));
CREATE POLICY "Members delete own content_progress" ON public.content_progress FOR DELETE TO authenticated
  USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

-- stream_attendance
CREATE POLICY "Members read own stream_attendance" ON public.stream_attendance FOR SELECT TO authenticated
  USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));
CREATE POLICY "Members insert own stream_attendance" ON public.stream_attendance FOR INSERT TO authenticated
  WITH CHECK (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));
CREATE POLICY "Members update own stream_attendance" ON public.stream_attendance FOR UPDATE TO authenticated
  USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()))
  WITH CHECK (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));
CREATE POLICY "Members delete own stream_attendance" ON public.stream_attendance FOR DELETE TO authenticated
  USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

COMMIT;

-- ============================================================================
-- ROLLBACK (returns to prior no-policy / service-role-only state)
-- ============================================================================
-- BEGIN;
-- DROP POLICY IF EXISTS "Members read own teaching_progress"   ON public.teaching_progress;
-- DROP POLICY IF EXISTS "Members insert own teaching_progress" ON public.teaching_progress;
-- DROP POLICY IF EXISTS "Members update own teaching_progress" ON public.teaching_progress;
-- DROP POLICY IF EXISTS "Members delete own teaching_progress" ON public.teaching_progress;
-- DROP POLICY IF EXISTS "Members read own teaching_bookmarks"   ON public.teaching_bookmarks;
-- DROP POLICY IF EXISTS "Members insert own teaching_bookmarks" ON public.teaching_bookmarks;
-- DROP POLICY IF EXISTS "Members update own teaching_bookmarks" ON public.teaching_bookmarks;
-- DROP POLICY IF EXISTS "Members delete own teaching_bookmarks" ON public.teaching_bookmarks;
-- DROP POLICY IF EXISTS "Members read own content_progress"   ON public.content_progress;
-- DROP POLICY IF EXISTS "Members insert own content_progress" ON public.content_progress;
-- DROP POLICY IF EXISTS "Members update own content_progress" ON public.content_progress;
-- DROP POLICY IF EXISTS "Members delete own content_progress" ON public.content_progress;
-- DROP POLICY IF EXISTS "Members read own stream_attendance"   ON public.stream_attendance;
-- DROP POLICY IF EXISTS "Members insert own stream_attendance" ON public.stream_attendance;
-- DROP POLICY IF EXISTS "Members update own stream_attendance" ON public.stream_attendance;
-- DROP POLICY IF EXISTS "Members delete own stream_attendance" ON public.stream_attendance;
-- COMMIT;
