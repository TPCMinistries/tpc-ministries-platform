-- ============================================
-- 044: Kenya Logistics, Media & Pipeline Tables
-- Adds 6 new tables for the expanded Command Center
-- ============================================

-- ============================================
-- 1. CONFERENCE SESSIONS
-- Nairobi (Apr 24) + Mombasa (May 3) conference schedules
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_conference_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  conference_name VARCHAR(100) NOT NULL,
  conference_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  session_type VARCHAR(30) NOT NULL DEFAULT 'session'
    CHECK (session_type IN ('keynote', 'session', 'workshop', 'panel', 'break', 'worship', 'meal')),
  title VARCHAR(255) NOT NULL,
  speaker VARCHAR(255),
  track VARCHAR(50),
  materials_url TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kenya_conf_sessions_trip ON public.kenya_trip_conference_sessions(trip_id);
CREATE INDEX idx_kenya_conf_sessions_date ON public.kenya_trip_conference_sessions(conference_date);

-- ============================================
-- 2. LOGISTICS MATRIX
-- Day x Track grid cells for multi-track planning
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_logistics_matrix (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  day_date DATE NOT NULL,
  track VARCHAR(50) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(trip_id, day_date, track)
);

CREATE INDEX idx_kenya_logistics_trip ON public.kenya_trip_logistics_matrix(trip_id);
CREATE INDEX idx_kenya_logistics_date ON public.kenya_trip_logistics_matrix(day_date);

-- ============================================
-- 3. MEDIA CALENDAR
-- Content calendar: date, platform, content_type, title, status
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_media_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  post_date DATE NOT NULL,
  platform VARCHAR(30) NOT NULL DEFAULT 'instagram'
    CHECK (platform IN ('instagram', 'facebook', 'youtube', 'tiktok', 'twitter', 'website')),
  content_type VARCHAR(30) NOT NULL DEFAULT 'photo'
    CHECK (content_type IN ('photo', 'video', 'reel', 'story', 'carousel', 'blog', 'live')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to VARCHAR(255),
  status VARCHAR(30) NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'in_progress', 'ready', 'published')),
  asset_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kenya_media_cal_trip ON public.kenya_trip_media_calendar(trip_id);
CREATE INDEX idx_kenya_media_cal_date ON public.kenya_trip_media_calendar(post_date);

-- ============================================
-- 4. MEDIA ASSIGNMENTS
-- Who covers what track on what day
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_media_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  day_date DATE NOT NULL,
  track VARCHAR(50) NOT NULL,
  assigned_to VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kenya_media_assign_trip ON public.kenya_trip_media_assignments(trip_id);

-- ============================================
-- 5. SHOT LIST
-- Shot descriptions with priority and captured flag
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_shot_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  location VARCHAR(255),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('high', 'medium', 'low')),
  is_captured BOOLEAN DEFAULT FALSE,
  captured_by VARCHAR(255),
  asset_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kenya_shot_list_trip ON public.kenya_trip_shot_list(trip_id);

-- ============================================
-- 6. WAITING LIST (Pipeline)
-- Prospect pipeline: "waiting to hear" funnel
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_waiting_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  source VARCHAR(50) NOT NULL DEFAULT 'website'
    CHECK (source IN ('website', 'referral', 'church', 'social_media', 'event', 'other')),
  interest_level VARCHAR(20) NOT NULL DEFAULT 'medium'
    CHECK (interest_level IN ('high', 'medium', 'low')),
  status VARCHAR(30) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'interested', 'committed', 'promoted', 'declined')),
  follow_up_date DATE,
  follow_up_notes TEXT,
  promoted_to_participant_id UUID REFERENCES public.kenya_trip_participants(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kenya_waiting_trip ON public.kenya_trip_waiting_list(trip_id);
CREATE INDEX idx_kenya_waiting_status ON public.kenya_trip_waiting_list(status);
CREATE INDEX idx_kenya_waiting_followup ON public.kenya_trip_waiting_list(follow_up_date);

-- ============================================
-- RLS POLICIES - Admin full access on all tables
-- ============================================
ALTER TABLE public.kenya_trip_conference_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_logistics_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_media_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_media_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_shot_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_waiting_list ENABLE ROW LEVEL SECURITY;

-- Conference Sessions
CREATE POLICY "Admin full access conference sessions"
  ON public.kenya_trip_conference_sessions FOR ALL
  USING (public.is_tpc_admin());

-- Logistics Matrix
CREATE POLICY "Admin full access logistics matrix"
  ON public.kenya_trip_logistics_matrix FOR ALL
  USING (public.is_tpc_admin());

-- Media Calendar
CREATE POLICY "Admin full access media calendar"
  ON public.kenya_trip_media_calendar FOR ALL
  USING (public.is_tpc_admin());

-- Media Assignments
CREATE POLICY "Admin full access media assignments"
  ON public.kenya_trip_media_assignments FOR ALL
  USING (public.is_tpc_admin());

-- Shot List
CREATE POLICY "Admin full access shot list"
  ON public.kenya_trip_shot_list FOR ALL
  USING (public.is_tpc_admin());

-- Waiting List
CREATE POLICY "Admin full access waiting list"
  ON public.kenya_trip_waiting_list FOR ALL
  USING (public.is_tpc_admin());

-- ============================================
-- SEED: Pre-populate Nairobi Conference (19 sessions)
-- ============================================
INSERT INTO public.kenya_trip_conference_sessions (trip_id, conference_name, conference_date, start_time, end_time, session_type, title, speaker, track, sort_order)
SELECT
  t.id,
  s.conference_name,
  s.conference_date::DATE,
  s.start_time::TIME,
  s.end_time::TIME,
  s.session_type,
  s.title,
  s.speaker,
  s.track,
  s.sort_order
FROM public.kenya_trips t
CROSS JOIN (VALUES
  ('Nairobi Conference', '2026-04-24', '08:00', '08:30', 'worship', 'Opening Worship & Prayer', NULL, NULL, 1),
  ('Nairobi Conference', '2026-04-24', '08:30', '09:15', 'keynote', 'Kingdom Impact: Vision for Kenya', 'Pastor Lorenzo', NULL, 2),
  ('Nairobi Conference', '2026-04-24', '09:15', '09:30', 'break', 'Tea Break', NULL, NULL, 3),
  ('Nairobi Conference', '2026-04-24', '09:30', '10:15', 'session', 'Community Health Assessment', NULL, 'healthcare', 4),
  ('Nairobi Conference', '2026-04-24', '09:30', '10:15', 'session', 'Educational Technology Workshop', NULL, 'education', 5),
  ('Nairobi Conference', '2026-04-24', '09:30', '10:15', 'session', 'Micro-Enterprise Development', NULL, 'business', 6),
  ('Nairobi Conference', '2026-04-24', '09:30', '10:15', 'session', 'Church Leadership Training', NULL, 'ministry', 7),
  ('Nairobi Conference', '2026-04-24', '10:15', '11:00', 'session', 'Medical Outreach Planning', NULL, 'healthcare', 8),
  ('Nairobi Conference', '2026-04-24', '10:15', '11:00', 'session', 'STEM Curriculum Development', NULL, 'education', 9),
  ('Nairobi Conference', '2026-04-24', '10:15', '11:00', 'session', 'Financial Literacy Program', NULL, 'business', 10),
  ('Nairobi Conference', '2026-04-24', '10:15', '11:00', 'session', 'Discipleship & Mentoring', NULL, 'ministry', 11),
  ('Nairobi Conference', '2026-04-24', '11:00', '11:30', 'worship', 'Worship & Intercession', NULL, NULL, 12),
  ('Nairobi Conference', '2026-04-24', '11:30', '12:15', 'panel', 'Cross-Cultural Ministry Panel', NULL, NULL, 13),
  ('Nairobi Conference', '2026-04-24', '12:15', '13:30', 'meal', 'Lunch & Fellowship', NULL, NULL, 14),
  ('Nairobi Conference', '2026-04-24', '13:30', '14:15', 'workshop', 'Trauma-Informed Care', NULL, 'healthcare', 15),
  ('Nairobi Conference', '2026-04-24', '13:30', '14:15', 'workshop', 'Digital Evangelism Tools', NULL, 'ministry', 16),
  ('Nairobi Conference', '2026-04-24', '14:15', '15:00', 'session', 'Team Coordination & Logistics', NULL, NULL, 17),
  ('Nairobi Conference', '2026-04-24', '15:00', '15:30', 'worship', 'Closing Worship', NULL, NULL, 18),
  ('Nairobi Conference', '2026-04-24', '15:30', '16:00', 'keynote', 'Commissioning & Sending', 'Pastor Lorenzo', NULL, 19)
) AS s(conference_name, conference_date, start_time, end_time, session_type, title, speaker, track, sort_order)
WHERE t.name = 'Kenya Kingdom Impact Trip 2026'
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED: Pre-populate Mombasa Conference (8 sessions)
-- ============================================
INSERT INTO public.kenya_trip_conference_sessions (trip_id, conference_name, conference_date, start_time, end_time, session_type, title, speaker, track, sort_order)
SELECT
  t.id,
  s.conference_name,
  s.conference_date::DATE,
  s.start_time::TIME,
  s.end_time::TIME,
  s.session_type,
  s.title,
  s.speaker,
  s.track,
  s.sort_order
FROM public.kenya_trips t
CROSS JOIN (VALUES
  ('Mombasa Conference', '2026-05-03', '09:00', '09:30', 'worship', 'Opening Worship', NULL, NULL, 1),
  ('Mombasa Conference', '2026-05-03', '09:30', '10:15', 'keynote', 'Coastal Community Impact', 'Pastor Lorenzo', NULL, 2),
  ('Mombasa Conference', '2026-05-03', '10:15', '10:30', 'break', 'Tea Break', NULL, NULL, 3),
  ('Mombasa Conference', '2026-05-03', '10:30', '11:15', 'session', 'Coastal Health Initiatives', NULL, 'healthcare', 4),
  ('Mombasa Conference', '2026-05-03', '10:30', '11:15', 'session', 'Maritime Business Opportunities', NULL, 'business', 5),
  ('Mombasa Conference', '2026-05-03', '11:15', '12:00', 'panel', 'Community Transformation Stories', NULL, NULL, 6),
  ('Mombasa Conference', '2026-05-03', '12:00', '13:00', 'meal', 'Lunch & Networking', NULL, NULL, 7),
  ('Mombasa Conference', '2026-05-03', '13:00', '14:00', 'keynote', 'Closing & Commissioning', 'Pastor Lorenzo', NULL, 8)
) AS s(conference_name, conference_date, start_time, end_time, session_type, title, speaker, track, sort_order)
WHERE t.name = 'Kenya Kingdom Impact Trip 2026'
ON CONFLICT DO NOTHING;
