-- ============================================
-- 047: Seed Hotel Blocks, Correct Conference Sessions, Support Roles
-- Phase 3 - Operational Readiness
-- ============================================

-- ============================================
-- 1A. EXPAND session_type constraint
-- Add: setup, registration, reception, showcase, commitment, debrief
-- ============================================
ALTER TABLE public.kenya_trip_conference_sessions
  DROP CONSTRAINT IF EXISTS kenya_trip_conference_sessions_session_type_check;

ALTER TABLE public.kenya_trip_conference_sessions
  ADD CONSTRAINT kenya_trip_conference_sessions_session_type_check
  CHECK (session_type IN (
    'keynote', 'session', 'workshop', 'panel', 'break', 'worship', 'meal',
    'setup', 'registration', 'reception', 'showcase', 'commitment', 'debrief'
  ));

-- ============================================
-- 1B. SEED 4 HOTEL BLOCKS into kenya_trip_lodging
-- ============================================
DO $$
DECLARE v_trip_id UUID;
BEGIN
  SELECT id INTO v_trip_id FROM public.kenya_trips ORDER BY created_at DESC LIMIT 1;

  IF v_trip_id IS NOT NULL THEN
    INSERT INTO public.kenya_trip_lodging
      (trip_id, name, city, check_in_date, check_out_date, total_rooms, booking_status, rate_per_night, notes)
    VALUES
      (v_trip_id, 'TBD — confirm property', 'Nairobi', '2026-04-22', '2026-04-25', 6,
       '❓ Researching', NULL, 'Need block for US delegates. Confirm hotel ASAP.'),
      (v_trip_id, 'TBD — ask Prophet Caleb', 'Kakamega', '2026-04-25', '2026-04-30', 6,
       '⬜ Not started', NULL, 'Ask Prophet Caleb for recommendation.'),
      (v_trip_id, 'TBD — conference venue proximity', 'Mombasa', '2026-05-01', '2026-05-04', 6,
       '⬜ Not started', NULL, 'Conference venue proximity important.'),
      (v_trip_id, 'TBD — near JKIA', 'Nairobi', '2026-05-05', '2026-05-06', 4,
       '⬜ Not started', NULL, 'Near JKIA for departures.')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================
-- 1C. REPLACE CONFERENCE SESSIONS
-- Delete old seed from migration 044, insert 28 correct sessions
-- ============================================
DO $$
DECLARE v_trip_id UUID;
BEGIN
  SELECT id INTO v_trip_id FROM public.kenya_trips ORDER BY created_at DESC LIMIT 1;

  IF v_trip_id IS NOT NULL THEN
    -- Remove all existing sessions for this trip
    DELETE FROM public.kenya_trip_conference_sessions WHERE trip_id = v_trip_id;

    -- ========== NAIROBI BUSINESS CONFERENCE — Fri Apr 24 (20 sessions) ==========
    INSERT INTO public.kenya_trip_conference_sessions
      (trip_id, conference_name, conference_date, start_time, end_time, session_type, title, speaker, track, sort_order)
    VALUES
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '07:30', '08:30', 'setup',
       'Setup & Preparation', NULL, NULL, 1),
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '08:30', '09:00', 'registration',
       'Doors Open / Registration', NULL, NULL, 2),
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '09:00', '09:10', 'session',
       'Opening Remarks', NULL, NULL, 3),
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '09:10', '09:45', 'keynote',
       'Keynote Address', 'Lorenzo', NULL, 4),
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '09:45', '10:15', 'session',
       'Speaker Session', 'Achumboro', 'business', 5),
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '10:15', '10:45', 'session',
       'Speaker Session', 'Dr. Shem', NULL, 6),
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '10:45', '11:00', 'break',
       'Break', NULL, NULL, 7),
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '11:00', '11:30', 'session',
       'Speaker Session', 'Michael Hopkins', NULL, 8),
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '11:30', '12:15', 'panel',
       'Panel Discussion', NULL, NULL, 9),
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '12:15', '13:15', 'meal',
       'Lunch & Networking', NULL, NULL, 10),
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '13:15', '14:15', 'workshop',
       'Workshop A: AI Tools for Business', 'Michael Hopkins', 'business', 11),
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '13:15', '14:15', 'workshop',
       'Workshop B: Funding & Capital Access', 'Lorenzo / Achumboro', 'business', 12),
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '14:15', '14:45', 'showcase',
       'Showcase: Local Innovators', 'Dr. Shem (Curator)', NULL, 13),
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '14:45', '15:00', 'session',
       'Mentoring Connections', NULL, NULL, 14),
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '15:00', '15:15', 'break',
       'Break', NULL, NULL, 15),
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '15:15', '15:30', 'commitment',
       'Commitment Call', NULL, NULL, 16),
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '15:30', '16:00', 'keynote',
       'Closing Keynote', 'Lorenzo', NULL, 17),
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '16:00', '16:30', 'reception',
       'Reception & Networking', NULL, NULL, 18),
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '16:30', '17:00', 'debrief',
       'Team Debrief', NULL, NULL, 19),
      (v_trip_id, 'Nairobi Business Conference', '2026-04-24', '18:00', '20:00', 'meal',
       'Team Dinner', NULL, NULL, 20);

    -- ========== MOMBASA CONFERENCE — Sun May 3 (8 sessions) ==========
    INSERT INTO public.kenya_trip_conference_sessions
      (trip_id, conference_name, conference_date, start_time, end_time, session_type, title, speaker, track, sort_order)
    VALUES
      (v_trip_id, 'Mombasa Conference', '2026-05-03', '13:00', '13:10', 'session',
       'Welcome & Opening', NULL, NULL, 1),
      (v_trip_id, 'Mombasa Conference', '2026-05-03', '13:10', '13:40', 'keynote',
       'Keynote Address', 'Lorenzo', NULL, 2),
      (v_trip_id, 'Mombasa Conference', '2026-05-03', '13:40', '14:00', 'session',
       'Speaker Session', 'Achumboro', 'business', 3),
      (v_trip_id, 'Mombasa Conference', '2026-05-03', '14:00', '14:20', 'session',
       'Speaker Session', 'Michael Hopkins', NULL, 4),
      (v_trip_id, 'Mombasa Conference', '2026-05-03', '14:20', '14:40', 'showcase',
       'Showcase', 'Dr. Shem', NULL, 5),
      (v_trip_id, 'Mombasa Conference', '2026-05-03', '14:40', '15:10', 'panel',
       'Panel + Q&A', NULL, NULL, 6),
      (v_trip_id, 'Mombasa Conference', '2026-05-03', '15:10', '15:30', 'commitment',
       'Commitment Call', NULL, NULL, 7),
      (v_trip_id, 'Mombasa Conference', '2026-05-03', '15:30', '16:30', 'reception',
       'Reception & Networking', NULL, NULL, 8);
  END IF;
END $$;

-- ============================================
-- 1D. CREATE kenya_trip_support_roles TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_support_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  role_name VARCHAR(255) NOT NULL,
  when_where VARCHAR(255),
  assigned_to VARCHAR(255),
  status VARCHAR(30) NOT NULL DEFAULT 'unassigned'
    CHECK (status IN ('unassigned', 'assigned', 'confirmed')),
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kenya_support_roles_trip ON public.kenya_trip_support_roles(trip_id);

-- RLS
ALTER TABLE public.kenya_trip_support_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access support roles"
  ON public.kenya_trip_support_roles FOR ALL
  USING (public.is_tpc_admin());

-- SEED 6 support roles
DO $$
DECLARE v_trip_id UUID;
BEGIN
  SELECT id INTO v_trip_id FROM public.kenya_trips ORDER BY created_at DESC LIMIT 1;

  IF v_trip_id IS NOT NULL THEN
    INSERT INTO public.kenya_trip_support_roles
      (trip_id, role_name, when_where, assigned_to, status, notes, sort_order)
    VALUES
      (v_trip_id, 'Greeter / Registration Lead',
       'Nairobi + Mombasa conferences', NULL, 'unassigned',
       'Manages check-in table, name badges, welcome packets', 1),
      (v_trip_id, 'Greeter / Registration Support (x2)',
       'Conference days', NULL, 'unassigned',
       'Assists lead with check-in and directing attendees', 2),
      (v_trip_id, 'Logistics / Transport Coordinator',
       'All cities', NULL, 'unassigned',
       'Ground transport, luggage, hotel liaison, vendor coordination', 3),
      (v_trip_id, 'Social Media / Content Capture',
       'Whole trip', NULL, 'unassigned',
       'Real-time stories, reels, photos. Coordinates with media track.', 4),
      (v_trip_id, 'Prayer / Intercession Lead',
       'All cities', NULL, 'unassigned',
       'Morning devotionals, prayer coverage during sessions, altar support', 5),
      (v_trip_id, 'Medical Camp Support (x2)',
       'Kakamega + Mombasa', NULL, 'unassigned',
       'Assist Dr. Griffith with medical camps. No clinical license required.', 6)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
