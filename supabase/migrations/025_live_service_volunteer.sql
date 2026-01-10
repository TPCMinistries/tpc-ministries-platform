-- Migration: Live Service & Volunteer System
-- Created: 2024
-- NOTE: Run this AFTER members table exists

-- ======================
-- LIVE SERVICES
-- ======================

CREATE TABLE IF NOT EXISTS live_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  service_type TEXT DEFAULT 'sunday',
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  stream_url TEXT,
  chat_enabled BOOLEAN DEFAULT TRUE,
  notes_enabled BOOLEAN DEFAULT TRUE,
  giving_prompt_enabled BOOLEAN DEFAULT TRUE,
  poll_enabled BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'scheduled',
  attendee_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_services_status ON live_services(status);
CREATE INDEX IF NOT EXISTS idx_live_services_scheduled ON live_services(scheduled_start);

-- Service attendance tracking
CREATE TABLE IF NOT EXISTS service_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES live_services(id) ON DELETE CASCADE,
  member_id UUID,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  watch_duration INTEGER DEFAULT 0,
  device_type TEXT
);

CREATE INDEX IF NOT EXISTS idx_service_attendance_service ON service_attendance(service_id);
CREATE INDEX IF NOT EXISTS idx_service_attendance_member ON service_attendance(member_id);

-- Sermon notes during live service
CREATE TABLE IF NOT EXISTS service_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES live_services(id) ON DELETE CASCADE,
  member_id UUID,
  content TEXT NOT NULL,
  timestamp_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_notes_service ON service_notes(service_id);
CREATE INDEX IF NOT EXISTS idx_service_notes_member ON service_notes(member_id);

-- Live service polls
CREATE TABLE IF NOT EXISTS service_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES live_services(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  show_results BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_service_polls_service ON service_polls(service_id);

-- Poll responses
CREATE TABLE IF NOT EXISTS poll_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES service_polls(id) ON DELETE CASCADE,
  member_id UUID,
  selected_option INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_poll_responses_poll ON poll_responses(poll_id);

-- ======================
-- VOLUNTEER SYSTEM
-- ======================

-- Volunteer opportunities/positions
CREATE TABLE IF NOT EXISTS volunteer_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  ministry_area TEXT NOT NULL,
  requirements TEXT,
  commitment_level TEXT,
  training_required BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_opportunities_ministry ON volunteer_opportunities(ministry_area);
CREATE INDEX IF NOT EXISTS idx_volunteer_opportunities_active ON volunteer_opportunities(is_active);

-- Volunteer shifts/schedules
CREATE TABLE IF NOT EXISTS volunteer_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES volunteer_opportunities(id) ON DELETE CASCADE,
  service_id UUID REFERENCES live_services(id) ON DELETE SET NULL,
  title TEXT,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slots_available INTEGER DEFAULT 1,
  slots_filled INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_opportunity ON volunteer_shifts(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_date ON volunteer_shifts(shift_date);

-- Volunteer signups
CREATE TABLE IF NOT EXISTS volunteer_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES volunteer_shifts(id) ON DELETE CASCADE,
  member_id UUID,
  status TEXT DEFAULT 'confirmed',
  notes TEXT,
  signed_up_at TIMESTAMPTZ DEFAULT NOW(),
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  hours_logged DECIMAL(4,2)
);

CREATE INDEX IF NOT EXISTS idx_volunteer_signups_shift ON volunteer_signups(shift_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_signups_member ON volunteer_signups(member_id);

-- Volunteer hours tracking
CREATE TABLE IF NOT EXISTS volunteer_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID,
  opportunity_id UUID REFERENCES volunteer_opportunities(id) ON DELETE SET NULL,
  shift_id UUID REFERENCES volunteer_shifts(id) ON DELETE SET NULL,
  hours DECIMAL(4,2) NOT NULL,
  service_date DATE NOT NULL,
  description TEXT,
  approved BOOLEAN DEFAULT FALSE,
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_hours_member ON volunteer_hours(member_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_hours_date ON volunteer_hours(service_date);

-- Volunteer preferences
CREATE TABLE IF NOT EXISTS volunteer_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID,
  preferred_areas JSONB DEFAULT '[]',
  availability JSONB DEFAULT '{}',
  skills JSONB DEFAULT '[]',
  notes TEXT,
  interested_in_leadership BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_preferences_member ON volunteer_preferences(member_id);

-- ======================
-- ENABLE RLS (policies will be added later if members table exists)
-- ======================

ALTER TABLE live_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_preferences ENABLE ROW LEVEL SECURITY;

-- Simple open policies for now (tighten later with members table)
CREATE POLICY "Allow all live_services" ON live_services FOR ALL USING (true);
CREATE POLICY "Allow all service_attendance" ON service_attendance FOR ALL USING (true);
CREATE POLICY "Allow all service_notes" ON service_notes FOR ALL USING (true);
CREATE POLICY "Allow all service_polls" ON service_polls FOR ALL USING (true);
CREATE POLICY "Allow all poll_responses" ON poll_responses FOR ALL USING (true);
CREATE POLICY "Allow all volunteer_opportunities" ON volunteer_opportunities FOR ALL USING (true);
CREATE POLICY "Allow all volunteer_shifts" ON volunteer_shifts FOR ALL USING (true);
CREATE POLICY "Allow all volunteer_signups" ON volunteer_signups FOR ALL USING (true);
CREATE POLICY "Allow all volunteer_hours" ON volunteer_hours FOR ALL USING (true);
CREATE POLICY "Allow all volunteer_preferences" ON volunteer_preferences FOR ALL USING (true);
