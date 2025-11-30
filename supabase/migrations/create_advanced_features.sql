-- ============================================
-- TPC MINISTRIES ADVANCED FEATURES DATABASE
-- Complete Ministry Platform Schema
-- ============================================

-- ============================================
-- 1. BIBLE READING PLANS
-- ============================================

-- Reading Plans (templates)
CREATE TABLE IF NOT EXISTS reading_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL DEFAULT 21,
  plan_type TEXT DEFAULT 'bible' CHECK (plan_type IN ('bible', 'topical', 'devotional', 'book')),
  cover_image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reading Plan Days (content for each day)
CREATE TABLE IF NOT EXISTS reading_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES reading_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT,
  scripture_reference TEXT NOT NULL,
  scripture_text TEXT,
  devotional_content TEXT,
  reflection_questions TEXT[],
  audio_url TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member Reading Plan Progress
CREATE TABLE IF NOT EXISTS member_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES reading_plans(id) ON DELETE CASCADE,
  current_day INTEGER DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_read_at TIMESTAMPTZ,
  streak_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes JSONB DEFAULT '[]',
  UNIQUE(member_id, plan_id)
);

-- Reading Plan Day Completions
CREATE TABLE IF NOT EXISTS reading_day_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES reading_plans(id) ON DELETE CASCADE,
  day_id UUID NOT NULL REFERENCES reading_plan_days(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  time_spent_seconds INTEGER,
  notes TEXT,
  UNIQUE(member_id, day_id)
);

-- ============================================
-- 2. DAILY CHECK-IN & SPIRITUAL RHYTHM
-- ============================================

-- Daily Check-ins
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  checkin_type TEXT DEFAULT 'morning' CHECK (checkin_type IN ('morning', 'evening', 'midday')),

  -- Morning check-in fields
  gratitude_entry TEXT,
  prayer_focus TEXT,
  scripture_reflection TEXT,
  goals_for_day TEXT[],
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),

  -- Evening check-in fields
  god_moments TEXT,
  prayer_answered TEXT,
  tomorrow_prayer TEXT,
  day_rating INTEGER CHECK (day_rating BETWEEN 1 AND 5),

  -- Tracking
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, checkin_date, checkin_type)
);

-- Scripture of the Day
CREATE TABLE IF NOT EXISTS daily_scriptures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scripture_date DATE NOT NULL UNIQUE,
  scripture_reference TEXT NOT NULL,
  scripture_text TEXT NOT NULL,
  reflection TEXT,
  prayer TEXT,
  theme TEXT,
  audio_url TEXT,
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member Scripture Interactions
CREATE TABLE IF NOT EXISTS scripture_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  scripture_id UUID NOT NULL REFERENCES daily_scriptures(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  saved BOOLEAN DEFAULT false,
  shared BOOLEAN DEFAULT false,
  personal_reflection TEXT,
  UNIQUE(member_id, scripture_id)
);

-- ============================================
-- 3. ACCOUNTABILITY PARTNERS
-- ============================================

-- Accountability Partnerships
CREATE TABLE IF NOT EXISTS accountability_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member1_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  member2_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  partnership_type TEXT DEFAULT 'prayer' CHECK (partnership_type IN ('prayer', 'reading', 'fasting', 'general', 'mentorship')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'ended')),
  initiated_by UUID REFERENCES members(id),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  meeting_frequency TEXT DEFAULT 'weekly',
  shared_goals JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member1_id, member2_id, partnership_type)
);

-- Accountability Check-ins
CREATE TABLE IF NOT EXISTS accountability_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES accountability_partnerships(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES members(id),
  checkin_date DATE DEFAULT CURRENT_DATE,
  goals_met JSONB DEFAULT '[]',
  struggles TEXT,
  prayer_requests TEXT,
  encouragement TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partner Match Preferences
CREATE TABLE IF NOT EXISTS partner_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE UNIQUE,
  seeking_partner BOOLEAN DEFAULT false,
  preferred_types TEXT[] DEFAULT ARRAY['prayer'],
  preferred_gender TEXT CHECK (preferred_gender IN ('same', 'any')),
  preferred_age_range TEXT,
  availability TEXT,
  interests TEXT[],
  bio TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. SERMON NOTES
-- ============================================

-- Sermons
CREATE TABLE IF NOT EXISTS sermons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  speaker TEXT NOT NULL,
  sermon_date DATE NOT NULL,
  series_name TEXT,
  description TEXT,
  scripture_references TEXT[],
  video_url TEXT,
  audio_url TEXT,
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  is_published BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member Sermon Notes
CREATE TABLE IF NOT EXISTS sermon_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  sermon_id UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  notes_content TEXT,
  key_scriptures TEXT[],
  key_points TEXT[],
  action_items TEXT[],
  personal_application TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, sermon_id)
);

-- Sermon Note Highlights
CREATE TABLE IF NOT EXISTS sermon_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES sermon_notes(id) ON DELETE CASCADE,
  highlight_text TEXT NOT NULL,
  highlight_color TEXT DEFAULT 'yellow',
  timestamp_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. VOLUNTEER/MINISTRY TEAMS
-- ============================================

-- Ministry Teams
CREATE TABLE IF NOT EXISTS ministry_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('worship', 'outreach', 'children', 'youth', 'hospitality', 'media', 'prayer', 'admin', 'other')),
  leader_id UUID REFERENCES members(id),
  co_leader_id UUID REFERENCES members(id),
  meeting_schedule TEXT,
  requirements TEXT,
  image_url TEXT,
  is_accepting_volunteers BOOLEAN DEFAULT true,
  min_age INTEGER,
  background_check_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES ministry_teams(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'volunteer' CHECK (role IN ('leader', 'co_leader', 'coordinator', 'volunteer')),
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive', 'on_leave')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(team_id, member_id)
);

-- Volunteer Hours
CREATE TABLE IF NOT EXISTS volunteer_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  team_id UUID REFERENCES ministry_teams(id) ON DELETE SET NULL,
  service_date DATE NOT NULL,
  hours_served DECIMAL(4,2) NOT NULL,
  description TEXT,
  verified_by UUID REFERENCES members(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Opportunities
CREATE TABLE IF NOT EXISTS service_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES ministry_teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  service_date DATE,
  start_time TIME,
  end_time TIME,
  location TEXT,
  spots_available INTEGER DEFAULT 5,
  spots_filled INTEGER DEFAULT 0,
  requirements TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunity Signups
CREATE TABLE IF NOT EXISTS opportunity_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES service_opportunities(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'signed_up' CHECK (status IN ('signed_up', 'confirmed', 'completed', 'no_show', 'cancelled')),
  signed_up_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(opportunity_id, member_id)
);

-- ============================================
-- 6. PASTORAL CARE & COUNSELING
-- ============================================

-- Pastoral Staff
CREATE TABLE IF NOT EXISTS pastoral_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  title TEXT NOT NULL,
  specialty TEXT[],
  bio TEXT,
  photo_url TEXT,
  is_available BOOLEAN DEFAULT true,
  max_weekly_appointments INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Counseling Appointments
CREATE TABLE IF NOT EXISTS counseling_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  pastor_id UUID NOT NULL REFERENCES pastoral_staff(id),
  appointment_type TEXT DEFAULT 'counseling' CHECK (appointment_type IN ('counseling', 'prayer', 'spiritual_direction', 'marriage', 'crisis', 'general')),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_link TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  is_confidential BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastoral Care Notes (highly confidential)
CREATE TABLE IF NOT EXISTS pastoral_care_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES counseling_appointments(id) ON DELETE SET NULL,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  pastor_id UUID NOT NULL REFERENCES pastoral_staff(id),
  notes TEXT,
  follow_up_needed BOOLEAN DEFAULT false,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. FASTING TRACKER
-- ============================================

-- Fasting Events (church-wide)
CREATE TABLE IF NOT EXISTS fasting_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  fast_type TEXT DEFAULT 'partial' CHECK (fast_type IN ('full', 'partial', 'daniel', 'social_media', 'custom')),
  prayer_focus TEXT,
  resources JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member Fasting Log
CREATE TABLE IF NOT EXISTS fasting_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  event_id UUID REFERENCES fasting_events(id) ON DELETE SET NULL,
  fast_date DATE NOT NULL,
  fast_type TEXT DEFAULT 'partial',
  start_time TIME,
  end_time TIME,
  completed BOOLEAN DEFAULT false,
  prayer_focus TEXT,
  reflections TEXT,
  struggles TEXT,
  breakthroughs TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, fast_date)
);

-- ============================================
-- 8. ENHANCED GIVING
-- ============================================

-- Giving Funds/Categories
CREATE TABLE IF NOT EXISTS giving_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  goal_amount DECIMAL(12,2),
  current_amount DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donations (enhanced)
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  fund_id UUID REFERENCES giving_funds(id),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  transaction_id TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'annually')),
  donor_name TEXT,
  donor_email TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  notes TEXT,
  donated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Giving Goals
CREATE TABLE IF NOT EXISTS member_giving_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  goal_type TEXT DEFAULT 'tithe' CHECK (goal_type IN ('tithe', 'offering', 'missions', 'custom')),
  target_amount DECIMAL(12,2),
  frequency TEXT DEFAULT 'monthly',
  start_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. FAMILY ACCOUNTS
-- ============================================

-- Families
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name TEXT NOT NULL,
  primary_member_id UUID NOT NULL REFERENCES members(id),
  family_photo_url TEXT,
  anniversary_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family Members
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  relationship TEXT NOT NULL CHECK (relationship IN ('head', 'spouse', 'child', 'parent', 'grandparent', 'sibling', 'other')),
  first_name TEXT,
  birth_date DATE,
  is_child BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kids Content Access
CREATE TABLE IF NOT EXISTS kids_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT CHECK (content_type IN ('video', 'game', 'devotional', 'activity', 'song')),
  age_range TEXT,
  thumbnail_url TEXT,
  content_url TEXT,
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. MEMBER DIRECTORY & CELEBRATIONS
-- ============================================

-- Member Celebrations
CREATE TABLE IF NOT EXISTS member_celebrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  celebration_type TEXT NOT NULL CHECK (celebration_type IN ('birthday', 'spiritual_birthday', 'anniversary', 'membership_anniversary', 'baptism', 'other')),
  celebration_date DATE NOT NULL,
  year_joined INTEGER,
  notes TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Birthday/Celebration Messages
CREATE TABLE IF NOT EXISTS celebration_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  celebration_id UUID NOT NULL REFERENCES member_celebrations(id) ON DELETE CASCADE,
  from_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member Profile Extensions
CREATE TABLE IF NOT EXISTS member_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE UNIQUE,
  bio TEXT,
  testimony TEXT,
  spiritual_gifts TEXT[],
  interests TEXT[],
  favorite_scripture TEXT,
  prayer_requests_public BOOLEAN DEFAULT false,
  show_in_directory BOOLEAN DEFAULT true,
  allow_messages BOOLEAN DEFAULT true,
  profile_photo_url TEXT,
  cover_photo_url TEXT,
  social_links JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. WORSHIP & MUSIC
-- ============================================

-- Worship Playlists
CREATE TABLE IF NOT EXISTS worship_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  playlist_type TEXT DEFAULT 'weekly' CHECK (playlist_type IN ('weekly', 'themed', 'seasonal', 'special')),
  cover_image_url TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  youtube_url TEXT,
  is_current BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlist Songs
CREATE TABLE IF NOT EXISTS playlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES worship_playlists(id) ON DELETE CASCADE,
  song_title TEXT NOT NULL,
  artist TEXT,
  album TEXT,
  duration_seconds INTEGER,
  lyrics_url TEXT,
  chord_chart_url TEXT,
  song_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 12. PWA & PUSH NOTIFICATIONS CONFIG
-- ============================================

-- Push Notification Templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT,
  action_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled Notifications
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  template_id UUID REFERENCES notification_templates(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADD COLUMNS TO EXISTING MEMBERS TABLE
-- ============================================

-- Add new columns to members if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'birth_date') THEN
    ALTER TABLE members ADD COLUMN birth_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'spiritual_birthday') THEN
    ALTER TABLE members ADD COLUMN spiritual_birthday DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'baptism_date') THEN
    ALTER TABLE members ADD COLUMN baptism_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'membership_date') THEN
    ALTER TABLE members ADD COLUMN membership_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'gender') THEN
    ALTER TABLE members ADD COLUMN gender TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'marital_status') THEN
    ALTER TABLE members ADD COLUMN marital_status TEXT;
  END IF;
END $$;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE reading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_day_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_scriptures ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripture_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accountability_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE accountability_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastoral_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE counseling_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastoral_care_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fasting_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fasting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE giving_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_giving_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE kids_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_celebrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE celebration_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worship_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- Public read policies for shared content
DROP POLICY IF EXISTS "reading_plans_select" ON reading_plans;
CREATE POLICY "reading_plans_select" ON reading_plans FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "reading_plan_days_select" ON reading_plan_days;
CREATE POLICY "reading_plan_days_select" ON reading_plan_days FOR SELECT USING (true);

DROP POLICY IF EXISTS "daily_scriptures_select" ON daily_scriptures;
CREATE POLICY "daily_scriptures_select" ON daily_scriptures FOR SELECT USING (true);

DROP POLICY IF EXISTS "sermons_select" ON sermons;
CREATE POLICY "sermons_select" ON sermons FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "ministry_teams_select" ON ministry_teams;
CREATE POLICY "ministry_teams_select" ON ministry_teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "service_opportunities_select" ON service_opportunities;
CREATE POLICY "service_opportunities_select" ON service_opportunities FOR SELECT USING (true);

DROP POLICY IF EXISTS "fasting_events_select" ON fasting_events;
CREATE POLICY "fasting_events_select" ON fasting_events FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "giving_funds_select" ON giving_funds;
CREATE POLICY "giving_funds_select" ON giving_funds FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "pastoral_staff_select" ON pastoral_staff;
CREATE POLICY "pastoral_staff_select" ON pastoral_staff FOR SELECT USING (is_available = true);

DROP POLICY IF EXISTS "worship_playlists_select" ON worship_playlists;
CREATE POLICY "worship_playlists_select" ON worship_playlists FOR SELECT USING (published_at IS NOT NULL);

DROP POLICY IF EXISTS "kids_content_select" ON kids_content;
CREATE POLICY "kids_content_select" ON kids_content FOR SELECT USING (is_active = true);

-- Member-specific policies (they can access their own data)
DROP POLICY IF EXISTS "member_reading_progress_all" ON member_reading_progress;
CREATE POLICY "member_reading_progress_all" ON member_reading_progress FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM members WHERE id = member_id));

DROP POLICY IF EXISTS "reading_day_completions_all" ON reading_day_completions;
CREATE POLICY "reading_day_completions_all" ON reading_day_completions FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM members WHERE id = member_id));

DROP POLICY IF EXISTS "daily_checkins_all" ON daily_checkins;
CREATE POLICY "daily_checkins_all" ON daily_checkins FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM members WHERE id = member_id));

DROP POLICY IF EXISTS "scripture_interactions_all" ON scripture_interactions;
CREATE POLICY "scripture_interactions_all" ON scripture_interactions FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM members WHERE id = member_id));

DROP POLICY IF EXISTS "sermon_notes_all" ON sermon_notes;
CREATE POLICY "sermon_notes_all" ON sermon_notes FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM members WHERE id = member_id));

DROP POLICY IF EXISTS "fasting_logs_all" ON fasting_logs;
CREATE POLICY "fasting_logs_all" ON fasting_logs FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM members WHERE id = member_id));

DROP POLICY IF EXISTS "donations_select" ON donations;
CREATE POLICY "donations_select" ON donations FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM members WHERE id = member_id) OR is_anonymous = false);

DROP POLICY IF EXISTS "member_giving_goals_all" ON member_giving_goals;
CREATE POLICY "member_giving_goals_all" ON member_giving_goals FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM members WHERE id = member_id));

DROP POLICY IF EXISTS "counseling_appointments_all" ON counseling_appointments;
CREATE POLICY "counseling_appointments_all" ON counseling_appointments FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM members WHERE id = member_id));

DROP POLICY IF EXISTS "partner_preferences_all" ON partner_preferences;
CREATE POLICY "partner_preferences_all" ON partner_preferences FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM members WHERE id = member_id));

DROP POLICY IF EXISTS "accountability_partnerships_all" ON accountability_partnerships;
CREATE POLICY "accountability_partnerships_all" ON accountability_partnerships FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM members WHERE id = member1_id OR id = member2_id));

DROP POLICY IF EXISTS "member_profiles_select" ON member_profiles;
CREATE POLICY "member_profiles_select" ON member_profiles FOR SELECT USING (show_in_directory = true);

DROP POLICY IF EXISTS "member_profiles_update" ON member_profiles;
CREATE POLICY "member_profiles_update" ON member_profiles FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM members WHERE id = member_id));

DROP POLICY IF EXISTS "member_celebrations_select" ON member_celebrations;
CREATE POLICY "member_celebrations_select" ON member_celebrations FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "team_members_all" ON team_members;
CREATE POLICY "team_members_all" ON team_members FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM members WHERE id = member_id));

DROP POLICY IF EXISTS "volunteer_hours_all" ON volunteer_hours;
CREATE POLICY "volunteer_hours_all" ON volunteer_hours FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM members WHERE id = member_id));

DROP POLICY IF EXISTS "opportunity_signups_all" ON opportunity_signups;
CREATE POLICY "opportunity_signups_all" ON opportunity_signups FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM members WHERE id = member_id));

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================

-- Insert sample reading plans
INSERT INTO reading_plans (title, description, duration_days, plan_type, is_featured) VALUES
('21 Days of Prayer', 'Transform your prayer life with this focused 21-day journey into deeper communion with God.', 21, 'devotional', true),
('Gospel of John', 'Experience the life of Jesus through the eyes of the beloved disciple over 30 days.', 30, 'bible', true),
('Psalms of Praise', 'A 14-day journey through the most uplifting Psalms to cultivate a heart of worship.', 14, 'bible', false),
('Foundations of Faith', 'A 7-day introduction to the core beliefs and practices of Christianity.', 7, 'topical', true),
('Spiritual Warfare', 'Understand and engage in spiritual battle through this powerful 21-day study.', 21, 'topical', false)
ON CONFLICT DO NOTHING;

-- Insert sample giving funds
INSERT INTO giving_funds (name, description, icon, display_order) VALUES
('Tithes & Offerings', 'General fund supporting the ministry operations and staff.', 'heart', 1),
('Building Fund', 'Supporting our facility expansion and improvements.', 'building', 2),
('Missions', 'Funding missionaries and outreach programs around the world.', 'globe', 3),
('Benevolence', 'Helping members and community in times of need.', 'hand-heart', 4),
('Youth Ministry', 'Supporting programs for the next generation.', 'users', 5)
ON CONFLICT DO NOTHING;

-- Insert sample ministry teams
INSERT INTO ministry_teams (name, description, category, is_accepting_volunteers) VALUES
('Worship Team', 'Lead the congregation in worship through music and song.', 'worship', true),
('Greeters Ministry', 'Welcome guests and create a warm, inviting atmosphere.', 'hospitality', true),
('Children''s Ministry', 'Teach and nurture children in their faith journey.', 'children', true),
('Youth Ministry', 'Mentor and disciple teenagers in their walk with Christ.', 'youth', true),
('Prayer Team', 'Intercede for the church, community, and world.', 'prayer', true),
('Media Team', 'Handle sound, lighting, video, and online streaming.', 'media', true),
('Outreach Team', 'Reach the community through service and evangelism.', 'outreach', true),
('Small Group Leaders', 'Facilitate community groups for spiritual growth.', 'other', true)
ON CONFLICT DO NOTHING;

-- Insert sample notification templates
INSERT INTO notification_templates (template_key, title, body, action_url) VALUES
('daily_devotional', 'Your Daily Devotional is Ready', 'Start your day with God''s Word. Today''s devotional is waiting for you.', '/devotional'),
('prayer_reminder', 'Prayer Time', 'Take a moment to connect with God in prayer.', '/prayer'),
('reading_reminder', 'Continue Your Reading Plan', 'You''re on day {{day}} of {{plan}}. Keep up the great work!', '/reading-plans'),
('birthday_wish', 'Happy Birthday!', 'The TPC family wishes you a blessed birthday!', '/dashboard'),
('event_reminder', 'Event Starting Soon', '{{event_name}} starts in {{time}}. Don''t miss it!', '/events')
ON CONFLICT DO NOTHING;

-- Insert some sample daily scriptures
INSERT INTO daily_scriptures (scripture_date, scripture_reference, scripture_text, reflection, theme) VALUES
(CURRENT_DATE, 'Philippians 4:13', 'I can do all things through Christ who strengthens me.', 'Today, remember that your strength comes not from yourself, but from Christ dwelling within you. Whatever challenges you face, His power is sufficient.', 'Strength'),
(CURRENT_DATE + 1, 'Jeremiah 29:11', 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.', 'God''s plans for you are good. Even when circumstances seem uncertain, trust in His sovereign purpose for your life.', 'Hope'),
(CURRENT_DATE + 2, 'Psalm 23:1', 'The Lord is my shepherd; I shall not want.', 'Like a shepherd cares for his sheep, God provides for all your needs. Rest in His provision today.', 'Provision')
ON CONFLICT DO NOTHING;

SELECT 'Advanced features database schema created successfully!' as status;
