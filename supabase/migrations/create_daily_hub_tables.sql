-- ============================================
-- DAILY SPIRITUAL HUB TABLES
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Daily Check-ins Table
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood VARCHAR(50), -- grateful, peaceful, anxious, struggling, joyful, etc.
  prayer_focus TEXT,
  devotional_read BOOLEAN DEFAULT false,
  scripture_read BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, checkin_date)
);

-- 2. Member Streaks Table
CREATE TABLE IF NOT EXISTS public.member_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE UNIQUE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_checkin_date DATE,
  total_checkins INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Member Badges Table
CREATE TABLE IF NOT EXISTS public.member_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL, -- streak_7, streak_30, prayer_warrior, devoted_reader, etc.
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, badge_type)
);

-- 4. Daily Scripture Table (for Scripture of the Day)
CREATE TABLE IF NOT EXISTS public.daily_scriptures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  reference VARCHAR(100) NOT NULL,
  text TEXT NOT NULL,
  theme VARCHAR(100),
  reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Devotional Content Table
CREATE TABLE IF NOT EXISTS public.devotionals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  scripture_reference VARCHAR(100),
  scripture_text TEXT,
  content TEXT NOT NULL,
  prayer TEXT,
  reflection_questions JSONB, -- Array of questions
  author VARCHAR(100) DEFAULT 'TPC Ministries',
  series VARCHAR(100) DEFAULT 'Streams of Grace',
  audio_url TEXT,
  video_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Notification Preferences (extend members or create separate)
CREATE TABLE IF NOT EXISTS public.notification_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE UNIQUE,
  morning_devotional BOOLEAN DEFAULT true,
  morning_time TIME DEFAULT '07:00:00',
  evening_prayer BOOLEAN DEFAULT true,
  evening_time TIME DEFAULT '21:00:00',
  weekly_digest BOOLEAN DEFAULT true,
  weekly_digest_day INT DEFAULT 0, -- 0 = Sunday
  prayer_reminders BOOLEAN DEFAULT true,
  event_reminders BOOLEAN DEFAULT true,
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Daily Check-ins
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins" ON public.daily_checkins
  FOR SELECT TO authenticated
  USING (member_id IN (
    SELECT id FROM public.members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own checkins" ON public.daily_checkins
  FOR INSERT TO authenticated
  WITH CHECK (member_id IN (
    SELECT id FROM public.members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own checkins" ON public.daily_checkins
  FOR UPDATE TO authenticated
  USING (member_id IN (
    SELECT id FROM public.members WHERE user_id = auth.uid()
  ));

-- Member Streaks
ALTER TABLE public.member_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks" ON public.member_streaks
  FOR SELECT TO authenticated
  USING (member_id IN (
    SELECT id FROM public.members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own streaks" ON public.member_streaks
  FOR ALL TO authenticated
  USING (member_id IN (
    SELECT id FROM public.members WHERE user_id = auth.uid()
  ));

-- Member Badges
ALTER TABLE public.member_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges" ON public.member_badges
  FOR SELECT TO authenticated
  USING (member_id IN (
    SELECT id FROM public.members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Service role can manage badges" ON public.member_badges
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Daily Scriptures (public read)
ALTER TABLE public.daily_scriptures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read daily scriptures" ON public.daily_scriptures
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Service role can manage scriptures" ON public.daily_scriptures
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Devotionals (public read)
ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read devotionals" ON public.devotionals
  FOR SELECT TO authenticated, anon
  USING (is_published = true);

CREATE POLICY "Service role can manage devotionals" ON public.devotionals
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Notification Schedules
ALTER TABLE public.notification_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification schedules" ON public.notification_schedules
  FOR SELECT TO authenticated
  USING (member_id IN (
    SELECT id FROM public.members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own notification schedules" ON public.notification_schedules
  FOR ALL TO authenticated
  USING (member_id IN (
    SELECT id FROM public.members WHERE user_id = auth.uid()
  ));

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_daily_checkins_member_date ON public.daily_checkins(member_id, checkin_date);
CREATE INDEX IF NOT EXISTS idx_member_streaks_member ON public.member_streaks(member_id);
CREATE INDEX IF NOT EXISTS idx_member_badges_member ON public.member_badges(member_id);
CREATE INDEX IF NOT EXISTS idx_daily_scriptures_date ON public.daily_scriptures(date);
CREATE INDEX IF NOT EXISTS idx_devotionals_date ON public.devotionals(date);

-- ============================================
-- SEED SOME SAMPLE DATA
-- ============================================

-- Insert sample scriptures for the next 7 days
INSERT INTO public.daily_scriptures (date, reference, text, theme, reflection) VALUES
  (CURRENT_DATE, 'Philippians 4:13', 'I can do all things through Christ who strengthens me.', 'Strength', 'What challenges are you facing today that require God''s strength?'),
  (CURRENT_DATE + 1, 'Jeremiah 29:11', 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.', 'Hope', 'How does knowing God has a plan for you change your perspective?'),
  (CURRENT_DATE + 2, 'Psalm 23:1', 'The Lord is my shepherd; I shall not want.', 'Provision', 'In what areas of your life do you need to trust God as your shepherd?'),
  (CURRENT_DATE + 3, 'Romans 8:28', 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.', 'Purpose', 'How have you seen God work things together for good in your life?'),
  (CURRENT_DATE + 4, 'Isaiah 40:31', 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.', 'Renewal', 'Where do you need renewed strength today?'),
  (CURRENT_DATE + 5, 'Proverbs 3:5-6', 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.', 'Trust', 'What decisions are you facing where you need to trust God more?'),
  (CURRENT_DATE + 6, 'Matthew 11:28', 'Come to me, all you who are weary and burdened, and I will give you rest.', 'Rest', 'What burdens do you need to lay at Jesus'' feet today?')
ON CONFLICT (date) DO NOTHING;

-- ============================================
-- FUNCTION: Update streak on check-in
-- ============================================

CREATE OR REPLACE FUNCTION update_member_streak()
RETURNS TRIGGER AS $$
DECLARE
  current_streak_val INT;
  longest_streak_val INT;
  last_checkin DATE;
BEGIN
  -- Get current streak data
  SELECT current_streak, longest_streak, last_checkin_date
  INTO current_streak_val, longest_streak_val, last_checkin
  FROM public.member_streaks
  WHERE member_id = NEW.member_id;

  -- If no streak record exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.member_streaks (member_id, current_streak, longest_streak, last_checkin_date, total_checkins)
    VALUES (NEW.member_id, 1, 1, NEW.checkin_date, 1);
    RETURN NEW;
  END IF;

  -- Calculate new streak
  IF last_checkin IS NULL OR NEW.checkin_date - last_checkin > 1 THEN
    -- Streak broken or first check-in
    current_streak_val := 1;
  ELSIF NEW.checkin_date - last_checkin = 1 THEN
    -- Consecutive day
    current_streak_val := current_streak_val + 1;
  END IF;
  -- If same day, don't change streak

  -- Update longest streak if needed
  IF current_streak_val > longest_streak_val THEN
    longest_streak_val := current_streak_val;
  END IF;

  -- Update the streak record
  UPDATE public.member_streaks
  SET
    current_streak = current_streak_val,
    longest_streak = longest_streak_val,
    last_checkin_date = NEW.checkin_date,
    total_checkins = total_checkins + 1,
    updated_at = NOW()
  WHERE member_id = NEW.member_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for streak updates
DROP TRIGGER IF EXISTS trigger_update_streak ON public.daily_checkins;
CREATE TRIGGER trigger_update_streak
  AFTER INSERT ON public.daily_checkins
  FOR EACH ROW
  EXECUTE FUNCTION update_member_streak();

-- ============================================
-- FUNCTION: Check and award badges
-- ============================================

CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
  streak INT;
  total INT;
BEGIN
  SELECT current_streak, total_checkins INTO streak, total
  FROM public.member_streaks
  WHERE member_id = NEW.member_id;

  -- 7-day streak badge
  IF streak >= 7 THEN
    INSERT INTO public.member_badges (member_id, badge_type, badge_name, badge_description)
    VALUES (NEW.member_id, 'streak_7', 'Week Warrior', 'Completed 7 consecutive days of spiritual check-ins')
    ON CONFLICT (member_id, badge_type) DO NOTHING;
  END IF;

  -- 30-day streak badge
  IF streak >= 30 THEN
    INSERT INTO public.member_badges (member_id, badge_type, badge_name, badge_description)
    VALUES (NEW.member_id, 'streak_30', 'Monthly Devoted', 'Completed 30 consecutive days of spiritual check-ins')
    ON CONFLICT (member_id, badge_type) DO NOTHING;
  END IF;

  -- 100-day streak badge
  IF streak >= 100 THEN
    INSERT INTO public.member_badges (member_id, badge_type, badge_name, badge_description)
    VALUES (NEW.member_id, 'streak_100', 'Century Faithful', 'Completed 100 consecutive days of spiritual check-ins')
    ON CONFLICT (member_id, badge_type) DO NOTHING;
  END IF;

  -- First check-in badge
  IF total = 1 THEN
    INSERT INTO public.member_badges (member_id, badge_type, badge_name, badge_description)
    VALUES (NEW.member_id, 'first_checkin', 'Journey Begun', 'Completed your first spiritual check-in')
    ON CONFLICT (member_id, badge_type) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for badge awards (runs after streak update)
DROP TRIGGER IF EXISTS trigger_award_badges ON public.member_streaks;
CREATE TRIGGER trigger_award_badges
  AFTER UPDATE ON public.member_streaks
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_badges();

-- ============================================
-- DONE!
-- ============================================
SELECT 'Daily Hub tables created successfully!' as status;
