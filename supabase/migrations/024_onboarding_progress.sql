-- Migration: Onboarding Progress & Giving Pledges
-- Created: 2024
-- SIMPLIFIED VERSION - Tables and basic functions only

-- ======================
-- ADD MISSING COLUMNS TO MEMBERS (safe - checks if exists)
-- ======================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'avatar_url') THEN
    ALTER TABLE members ADD COLUMN avatar_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'bio') THEN
    ALTER TABLE members ADD COLUMN bio TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'is_profile_public') THEN
    ALTER TABLE members ADD COLUMN is_profile_public BOOLEAN DEFAULT TRUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'show_badges') THEN
    ALTER TABLE members ADD COLUMN show_badges BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- ======================
-- ONBOARDING PROGRESS TABLE
-- ======================

CREATE TABLE IF NOT EXISTS member_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE UNIQUE,
  profile_completed BOOLEAN DEFAULT FALSE,
  avatar_uploaded BOOLEAN DEFAULT FALSE,
  bio_added BOOLEAN DEFAULT FALSE,
  assessment_taken BOOLEAN DEFAULT FALSE,
  assessment_type TEXT,
  group_joined BOOLEAN DEFAULT FALSE,
  group_id UUID,
  notifications_configured BOOLEAN DEFAULT FALSE,
  first_checkin_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_onboarding_member ON member_onboarding(member_id);

-- ======================
-- GIVING PLEDGES TABLE
-- ======================

CREATE TABLE IF NOT EXISTS giving_pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  fund_id UUID,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly', 'one-time')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_giving_pledges_member ON giving_pledges(member_id);

-- ======================
-- MEMBER ACHIEVEMENTS TABLE
-- ======================

CREATE TABLE IF NOT EXISTS member_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB DEFAULT '{}',
  title TEXT NOT NULL,
  description TEXT,
  celebrated BOOLEAN DEFAULT FALSE,
  celebrated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_achievements_member ON member_achievements(member_id);

-- ======================
-- RLS POLICIES
-- ======================

ALTER TABLE member_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE giving_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Members can view own onboarding" ON member_onboarding;
DROP POLICY IF EXISTS "Members can update own onboarding" ON member_onboarding;
DROP POLICY IF EXISTS "System can insert onboarding" ON member_onboarding;

DROP POLICY IF EXISTS "Members can view own pledges" ON giving_pledges;
DROP POLICY IF EXISTS "Members can create own pledges" ON giving_pledges;
DROP POLICY IF EXISTS "Members can update own pledges" ON giving_pledges;
DROP POLICY IF EXISTS "Members can delete own pledges" ON giving_pledges;

DROP POLICY IF EXISTS "Members can view own achievements" ON member_achievements;
DROP POLICY IF EXISTS "Members can update own achievements" ON member_achievements;
DROP POLICY IF EXISTS "System can insert achievements" ON member_achievements;

-- Create policies for member_onboarding
CREATE POLICY "Members can view own onboarding" ON member_onboarding FOR SELECT
USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Members can update own onboarding" ON member_onboarding FOR UPDATE
USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "System can insert onboarding" ON member_onboarding FOR INSERT
WITH CHECK (true);

-- Create policies for giving_pledges
CREATE POLICY "Members can view own pledges" ON giving_pledges FOR SELECT
USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Members can create own pledges" ON giving_pledges FOR INSERT
WITH CHECK (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Members can update own pledges" ON giving_pledges FOR UPDATE
USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Members can delete own pledges" ON giving_pledges FOR DELETE
USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

-- Create policies for member_achievements
CREATE POLICY "Members can view own achievements" ON member_achievements FOR SELECT
USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Members can update own achievements" ON member_achievements FOR UPDATE
USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "System can insert achievements" ON member_achievements FOR INSERT
WITH CHECK (true);

-- ======================
-- Done! Triggers are handled by the application layer instead
-- ======================
