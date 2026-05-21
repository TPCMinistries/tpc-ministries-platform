-- Archive Kenya 2026 trip data. Trip completed 2026-05-06. Public funnels
-- (/kenya/pack-the-mission, /kenya/support/[slug], etc.) are now 308-redirected
-- to /kenya-2026 in next.config.mjs. The two public-facing SECURITY DEFINER
-- views that those funnels read are no longer reachable from any live page
-- or API route — dropping them eliminates the last two ERROR-level advisor
-- items related to Kenya. All underlying tables stay intact (data preserved
-- for impact reporting, future trip-template work, donor receipts).

drop view if exists public.kenya_trip_fundraising_public;
drop view if exists public.kenya_supply_pledge_stats;

-- Mark the 42 kenya_* tables as archives so future developers understand
-- they're historical. Pattern matches what next-session impact tooling
-- will key off to scope read-only queries.
comment on table public.kenya_trips                       is 'ARCHIVE: Kenya 2026 trip (completed 2026-05-06). Data preserved for impact reporting + future trip-template work. Public funnels retired.';
comment on table public.kenya_trip_participants           is 'ARCHIVE: Kenya 2026 — 23 participants. Do not display PII publicly without re-confirming consent.';
comment on table public.kenya_trip_itinerary              is 'ARCHIVE: Kenya 2026 — 52 itinerary entries.';
comment on table public.kenya_trip_flights                is 'ARCHIVE: Kenya 2026 — pre-trip flight records.';
comment on table public.kenya_trip_flight_passengers      is 'ARCHIVE: Kenya 2026 — flight passenger manifest.';
comment on table public.kenya_trip_lodging                is 'ARCHIVE: Kenya 2026 — 4 lodging locations.';
comment on table public.kenya_trip_room_assignments       is 'ARCHIVE: Kenya 2026 — room assignments.';
comment on table public.kenya_trip_contacts               is 'ARCHIVE: Kenya 2026 — 2 in-country contacts.';
comment on table public.kenya_trip_budget_categories      is 'ARCHIVE: Kenya 2026 — 9 budget categories.';
comment on table public.kenya_trip_expenses               is 'ARCHIVE: Kenya 2026 — recorded trip expenses.';
comment on table public.kenya_trip_announcements          is 'ARCHIVE: Kenya 2026 — pre-trip announcements.';
comment on table public.kenya_trip_documents              is 'ARCHIVE: Kenya 2026 — uploaded trip docs.';
comment on table public.kenya_trip_faqs                   is 'ARCHIVE: Kenya 2026 — trip FAQ entries.';
comment on table public.kenya_trip_daily_focus            is 'ARCHIVE: Kenya 2026 — daily focus content.';
comment on table public.kenya_trip_checkins               is 'ARCHIVE: Kenya 2026 — participant checkins.';
comment on table public.kenya_trip_packing_items          is 'ARCHIVE: Kenya 2026 — 24 packing items.';
comment on table public.kenya_trip_packing_status         is 'ARCHIVE: Kenya 2026 — per-participant packing status.';
comment on table public.kenya_trip_donations              is 'ARCHIVE: Kenya 2026 — designated trip donations.';
comment on table public.kenya_supply_pledges              is 'ARCHIVE: Kenya 2026 — pack-the-mission pledges.';
comment on table public.kenya_supply_funds                is 'ARCHIVE: Kenya 2026 — 8 supply funds.';
comment on table public.kenya_sponsorships                is 'ARCHIVE: Kenya 2026 — participant sponsorships.';
comment on table public.kenya_trip_conference_sessions    is 'ARCHIVE: Kenya 2026 — 28 conference sessions.';
comment on table public.kenya_trip_logistics_matrix       is 'ARCHIVE: Kenya 2026 — admin logistics matrix.';
comment on table public.kenya_trip_media_calendar         is 'ARCHIVE: Kenya 2026 — media production calendar.';
comment on table public.kenya_trip_media_assignments      is 'ARCHIVE: Kenya 2026 — media role assignments.';
comment on table public.kenya_trip_shot_list              is 'ARCHIVE: Kenya 2026 — content shot list.';
comment on table public.kenya_trip_waiting_list           is 'ARCHIVE: Kenya 2026 — 21 waitlist applicants.';
comment on table public.kenya_trip_action_items           is 'ARCHIVE: Kenya 2026 — 22 admin action items.';
comment on table public.kenya_trip_track_details          is 'ARCHIVE: Kenya 2026 — 5 service-track details.';
comment on table public.kenya_trip_track_materials        is 'ARCHIVE: Kenya 2026 — track materials.';
comment on table public.kenya_trip_admin_notes            is 'ARCHIVE: Kenya 2026 — internal admin notes.';
comment on table public.kenya_trip_support_roles          is 'ARCHIVE: Kenya 2026 — 6 support roles.';
comment on table public.kenya_trip_feed                   is 'ARCHIVE: Kenya 2026 — trip activity feed.';
comment on table public.kenya_trip_impact_logs            is 'ARCHIVE: Kenya 2026 — impact event logs.';
comment on table public.kenya_trip_reflections            is 'ARCHIVE: Kenya 2026 — participant reflections (PII; do not display publicly).';
comment on table public.kenya_trip_track_lead_notes       is 'ARCHIVE: Kenya 2026 — track lead notes.';
comment on table public.kenya_trip_track_plans            is 'ARCHIVE: Kenya 2026 — track plans.';
comment on table public.kenya_trip_admin_payments         is 'ARCHIVE: Kenya 2026 — 9 admin-recorded payments.';
comment on table public.kenya_trip_partners               is 'ARCHIVE: Kenya 2026 — partner organizations.';
comment on table public.kenya_trip_partner_proposals      is 'ARCHIVE: Kenya 2026 — partner proposals.';
comment on table public.kenya_trip_mission_funds          is 'ARCHIVE: Kenya 2026 — 1 mission-fund record.';
comment on table public.kenya_trip_payments               is 'ARCHIVE: Kenya 2026 — trip payment records.';
