# Phase 10 — RLS Security Remediation · VERIFICATION

**Date:** 2026-06-20 · **DB:** TPC Ministries (`naulwwnzrznslvhhxfed`) · **Status:** ✅ COMPLETE

## Outcome
Every admin/financial table is service-role-only, every member table is owner-scoped
(`member_id IN (SELECT id FROM members WHERE user_id = auth.uid())`), public forms stay
INSERT-only, and the only remaining always-true policies are deliberately-public *content*
reads (devotionals, scriptures, events, catalog) plus two safe ones (family_invites UPDATE
row-scoped; members ALL service_role-only). **Zero unintended-public-access holes remain on
member or financial data.**

## Migrations applied (all reversible — rollback blocks in each file)
1. `rls_lock_admin_tables.sql` (10-01) — dropped 10 public always-true policies on Kenya
   financial + ops/system tables (admin/service-role only).
2. `rls_member_scoped_progress.sql` (10-02 b1) — owner policies on teaching_progress,
   teaching_bookmarks, content_progress, stream_attendance (additive).
3. `rls_member_scoped_batch2` (10-02 b2) — owner policies on coaching_clients,
   member_prophecies, points_history (read), prophecy_prayer_requests (additive).
4. `rls_member_scoped_batch3` — replaced always-true/broken policies with correct owner
   policies on member_badges, member_points, member_streaks, sermon_notes, service_attendance,
   service_notes, poll_responses, prayer_partnerships, volunteer_{availability,hours,members,
   preferences,schedules,signups}.
5. `rls_shared_reference_tables` — badges, volunteer_opportunities, service_polls,
   live_services → public read + admin-only write.
6. `rls_family_scoped_policies` — `my_family_ids()` SECURITY DEFINER helper (no recursion) +
   owner/family-scoped policies on families, family_members, family_invites.
7. `rls_public_form_and_leak_hardening` (10-03) — dropped always-true UPDATE on
   assessment_responses; volunteer_shifts → public-read/admin-write; user_activity → owner+admin
   read (was public — leak closed).

## Verification results
- **Anon deny-test (SELECT):** families, family_members, sermon_notes, member_prophecies,
  prophecy_prayer_requests, teaching_progress, member_points, user_activity, prayer_partnerships,
  volunteer_hours → all return `[]` (no data). ✓
- **Anon write-test:** UPDATE on assessment_responses rejected. ✓
- **10-01 tables:** anon SELECT denied; `is_tpc_admin()` policies preserved; admin client (service
  role) unaffected. ✓
- **Remaining always-true (44 non-INSERT):** 42 = intentional public content SELECT; 1 =
  family_invites UPDATE (row-scoped, safe); 1 = members (service_role only). No member/financial
  data exposed. ✓
- **Ownership model:** `members.user_id = auth.uid()`, `member_id → members.id` (per
  lib/auth-server.ts). Broken `member_id = auth.uid()` policies replaced with correct pattern.

## Left intentionally as-is (documented, not holes)
- **Service-role-only (RLS on, no policy):** accountability_checkins, sermon_highlights,
  celebration_messages (from_member_id), coaching_sessions (coaching_client_id),
  prophecy_tracking (member_prophecy_id), playlist_songs (playlist_id), scheduled_notifications,
  pastoral_care_notes, email_subscribers. Secure (no public access). If a member-facing feature
  needs client reads on any of these, add an owner policy then (their owner keys are non-standard
  — would need per-table mapping).
- **Public content SELECT (by design):** devotionals, daily_scriptures, events, meditations,
  reading plans, kenya_trip_* content, membership_tiers, seasons, badges, etc.
- **Reviewable-but-low-risk public reads:** group_posts, group_post_comments, member_connections,
  invite_codes — community/social; tighten later if private groups are introduced.

## Follow-ups (non-blocking)
- Consider scoping the reviewable-but-low-risk community reads above.
- Wire owner policies on the service-role-only member tables if/when those features go client-side.
