-- ============================================
-- ENGAGEMENT FEATURES DATABASE SCHEMA
-- Testimony Wall, Streaks, Achievements,
-- Community Groups, Notifications, Live Streams
-- ============================================

-- ============================================
-- 1. TESTIMONY WALL
-- Members share breakthroughs and wins
-- ============================================
CREATE TABLE IF NOT EXISTS testimonies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  -- Content
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100), -- 'healing', 'provision', 'breakthrough', 'salvation', 'deliverance', 'answered_prayer', 'other'
  -- Media
  image_url TEXT,
  video_url TEXT,
  -- Visibility
  is_anonymous BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES members(id)
);

CREATE INDEX idx_testimonies_member ON testimonies(member_id);
CREATE INDEX idx_testimonies_approved ON testimonies(is_approved, created_at DESC);
CREATE INDEX idx_testimonies_featured ON testimonies(is_featured, created_at DESC);
CREATE INDEX idx_testimonies_category ON testimonies(category);

-- Testimony likes
CREATE TABLE IF NOT EXISTS testimony_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  testimony_id UUID REFERENCES testimonies(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(testimony_id, member_id)
);

-- Testimony comments
CREATE TABLE IF NOT EXISTS testimony_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  testimony_id UUID REFERENCES testimonies(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_testimony_comments ON testimony_comments(testimony_id, created_at);

-- ============================================
-- 2. STREAKS & ACHIEVEMENTS
-- Gamification for engagement
-- ============================================

-- Achievement definitions
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Basic info
  name VARCHAR(100) NOT NULL,
  description TEXT,
  -- Visual
  icon VARCHAR(50), -- emoji or icon name
  badge_color VARCHAR(50) DEFAULT 'gold',
  badge_image_url TEXT,
  -- Requirements
  category VARCHAR(50) NOT NULL, -- 'devotional', 'prayer', 'journal', 'community', 'learning', 'giving', 'streak', 'milestone'
  requirement_type VARCHAR(50) NOT NULL, -- 'count', 'streak', 'milestone', 'special'
  requirement_value INTEGER, -- e.g., 7 for "7 day streak"
  requirement_metadata JSONB, -- additional conditions
  -- Rewards
  points_awarded INTEGER DEFAULT 0,
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_secret BOOLEAN DEFAULT false, -- hidden until unlocked
  -- Order
  display_order INTEGER DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member achievements (unlocked)
CREATE TABLE IF NOT EXISTS member_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  notified BOOLEAN DEFAULT false,
  UNIQUE(member_id, achievement_id)
);

CREATE INDEX idx_member_achievements ON member_achievements(member_id, unlocked_at DESC);

-- Member streaks tracking
CREATE TABLE IF NOT EXISTS member_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  streak_type VARCHAR(50) NOT NULL, -- 'devotional', 'prayer', 'journal', 'login', 'giving'
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_started_at DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, streak_type)
);

CREATE INDEX idx_member_streaks ON member_streaks(member_id);

-- Member points/XP
CREATE TABLE IF NOT EXISTS member_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  points_this_month INTEGER DEFAULT 0,
  points_this_week INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id)
);

-- Points history
CREATE TABLE IF NOT EXISTS points_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason VARCHAR(255),
  source_type VARCHAR(50), -- 'achievement', 'activity', 'bonus', 'admin'
  source_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_points_history ON points_history(member_id, created_at DESC);

-- ============================================
-- 3. COMMUNITY GROUPS
-- Small group functionality
-- ============================================

CREATE TABLE IF NOT EXISTS community_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Basic info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  group_type VARCHAR(50) DEFAULT 'small_group', -- 'small_group', 'ministry_team', 'prayer_group', 'study_group', 'interest'
  -- Visual
  image_url TEXT,
  cover_image_url TEXT,
  -- Settings
  is_public BOOLEAN DEFAULT true, -- can anyone see/join
  requires_approval BOOLEAN DEFAULT false,
  max_members INTEGER,
  -- Meeting info
  meeting_schedule TEXT, -- e.g., "Every Tuesday at 7pm"
  meeting_location TEXT,
  meeting_link TEXT, -- for virtual meetings
  -- Leadership
  leader_id UUID REFERENCES members(id),
  -- Status
  is_active BOOLEAN DEFAULT true,
  -- Stats
  members_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_groups_type ON community_groups(group_type);
CREATE INDEX idx_groups_leader ON community_groups(leader_id);
CREATE INDEX idx_groups_public ON community_groups(is_public, is_active);

-- Group membership
CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES community_groups(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- 'leader', 'co-leader', 'member'
  status VARCHAR(50) DEFAULT 'active', -- 'pending', 'active', 'removed'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, member_id)
);

CREATE INDEX idx_group_members ON group_members(group_id);
CREATE INDEX idx_member_groups ON group_members(member_id);

-- Group posts/discussions
CREATE TABLE IF NOT EXISTS group_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES community_groups(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  -- Content
  content TEXT NOT NULL,
  post_type VARCHAR(50) DEFAULT 'discussion', -- 'discussion', 'prayer_request', 'announcement', 'testimony', 'question'
  -- Media
  image_url TEXT,
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  -- Status
  is_pinned BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_group_posts ON group_posts(group_id, created_at DESC);
CREATE INDEX idx_group_posts_pinned ON group_posts(group_id, is_pinned, created_at DESC);

-- Group post comments
CREATE TABLE IF NOT EXISTS group_post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES group_posts(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_group_post_comments ON group_post_comments(post_id, created_at);

-- Group post likes
CREATE TABLE IF NOT EXISTS group_post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES group_posts(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, member_id)
);

-- ============================================
-- 4. PUSH NOTIFICATIONS
-- Engagement reminders and updates
-- ============================================

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE UNIQUE,
  -- Push notification settings
  push_enabled BOOLEAN DEFAULT true,
  push_token TEXT, -- FCM/APNs token
  -- Email settings
  email_enabled BOOLEAN DEFAULT true,
  email_digest VARCHAR(50) DEFAULT 'daily', -- 'instant', 'daily', 'weekly', 'none'
  -- SMS settings
  sms_enabled BOOLEAN DEFAULT false,
  -- Notification types
  notify_devotional_reminder BOOLEAN DEFAULT true,
  notify_prayer_answered BOOLEAN DEFAULT true,
  notify_new_content BOOLEAN DEFAULT true,
  notify_group_activity BOOLEAN DEFAULT true,
  notify_achievement_unlocked BOOLEAN DEFAULT true,
  notify_streak_at_risk BOOLEAN DEFAULT true,
  notify_prophecy_received BOOLEAN DEFAULT true,
  notify_event_reminder BOOLEAN DEFAULT true,
  notify_messages BOOLEAN DEFAULT true,
  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification queue/history
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  -- Content
  title VARCHAR(255) NOT NULL,
  body TEXT,
  -- Type and action
  notification_type VARCHAR(50) NOT NULL, -- 'devotional', 'prayer', 'achievement', 'group', 'message', 'event', 'system'
  action_url TEXT, -- where to navigate when clicked
  action_data JSONB, -- additional data for the action
  -- Status
  is_read BOOLEAN DEFAULT false,
  is_sent BOOLEAN DEFAULT false,
  sent_via VARCHAR(50)[], -- ['push', 'email', 'sms']
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_member ON notifications(member_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(member_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_unsent ON notifications(is_sent, created_at);

-- Scheduled notifications (for reminders)
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  -- Content
  title VARCHAR(255) NOT NULL,
  body TEXT,
  notification_type VARCHAR(50) NOT NULL,
  action_url TEXT,
  -- Schedule
  scheduled_for TIMESTAMPTZ NOT NULL,
  repeat_pattern VARCHAR(50), -- 'daily', 'weekly', 'monthly', null for one-time
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scheduled_notifications ON scheduled_notifications(scheduled_for, is_active);

-- ============================================
-- 5. LIVE STREAMING
-- Integrated worship/teaching streams
-- ============================================

CREATE TABLE IF NOT EXISTS live_streams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Basic info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  -- Stream info
  stream_type VARCHAR(50) DEFAULT 'service', -- 'service', 'teaching', 'worship', 'prayer', 'special'
  stream_url TEXT, -- YouTube, Vimeo, or custom RTMP
  stream_platform VARCHAR(50), -- 'youtube', 'vimeo', 'facebook', 'custom'
  stream_key TEXT, -- for embedding
  thumbnail_url TEXT,
  -- Schedule
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  -- Status
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'live', 'ended', 'cancelled'
  -- Engagement
  viewer_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  chat_enabled BOOLEAN DEFAULT true,
  prayer_requests_enabled BOOLEAN DEFAULT true,
  -- Recording
  recording_url TEXT, -- after stream ends
  is_recorded BOOLEAN DEFAULT true,
  -- Access
  is_public BOOLEAN DEFAULT true,
  required_tier VARCHAR(50), -- null = free, 'partner', 'covenant'
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES members(id)
);

CREATE INDEX idx_live_streams_status ON live_streams(status, scheduled_start);
CREATE INDEX idx_live_streams_upcoming ON live_streams(scheduled_start) WHERE status = 'scheduled';

-- Stream chat messages
CREATE TABLE IF NOT EXISTS stream_chat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'chat', -- 'chat', 'prayer_request', 'amen', 'system'
  is_highlighted BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stream_chat ON stream_chat(stream_id, created_at);

-- Stream attendance
CREATE TABLE IF NOT EXISTS stream_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  watch_duration_seconds INTEGER DEFAULT 0,
  UNIQUE(stream_id, member_id)
);

CREATE INDEX idx_stream_attendance ON stream_attendance(stream_id);

-- ============================================
-- INSERT DEFAULT ACHIEVEMENTS
-- ============================================
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points_awarded, display_order) VALUES
-- Devotional achievements
('First Light', 'Read your first devotional', '🌅', 'devotional', 'count', 1, 10, 1),
('Week of Wonder', 'Read devotionals for 7 days in a row', '📖', 'streak', 'streak', 7, 50, 2),
('Monthly Devotee', 'Read devotionals for 30 days in a row', '📚', 'streak', 'streak', 30, 200, 3),
('Scripture Scholar', 'Read 100 devotionals', '🎓', 'devotional', 'count', 100, 500, 4),

-- Prayer achievements
('Prayer Warrior', 'Submit your first prayer request', '🙏', 'prayer', 'count', 1, 10, 10),
('Intercessor', 'Submit 50 prayer requests', '⚔️', 'prayer', 'count', 50, 100, 11),
('Prayer Champion', 'Pray for others 100 times', '👑', 'prayer', 'count', 100, 200, 12),

-- Journal achievements
('Soul Writer', 'Write your first journal entry', '✍️', 'journal', 'count', 1, 10, 20),
('Reflection Master', 'Write 30 journal entries', '📝', 'journal', 'count', 30, 100, 21),
('Voice of Revelation', 'Record 10 voice journals', '🎤', 'journal', 'count', 10, 75, 22),

-- Community achievements
('Community Member', 'Join your first group', '👥', 'community', 'count', 1, 20, 30),
('Encourager', 'Like 50 posts or testimonies', '❤️', 'community', 'count', 50, 50, 31),
('Testimony Sharer', 'Share your first testimony', '🌟', 'community', 'count', 1, 50, 32),

-- Learning achievements
('Student of the Word', 'Complete your first course', '📕', 'learning', 'count', 1, 100, 40),
('Graduate', 'Complete 5 courses', '🎓', 'learning', 'count', 5, 300, 41),
('Master Teacher', 'Complete all available courses', '🏆', 'learning', 'milestone', 1, 1000, 42),

-- Giving achievements
('Generous Heart', 'Make your first donation', '💝', 'giving', 'count', 1, 25, 50),
('Faithful Giver', 'Give for 3 consecutive months', '💰', 'giving', 'streak', 3, 100, 51),
('Kingdom Builder', 'Become a Partner member', '🏰', 'milestone', 'milestone', 1, 200, 52),

-- Special achievements
('Early Adopter', 'Joined TPC in the first year', '🌱', 'milestone', 'special', 1, 100, 60),
('Prophet''s Circle', 'Became a Covenant member', '👁️', 'milestone', 'milestone', 1, 500, 61),
('Worship Warrior', 'Attend 10 live streams', '🎵', 'community', 'count', 10, 100, 62)
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE testimonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimony_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimony_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_attendance ENABLE ROW LEVEL SECURITY;

-- Testimonies: Anyone can view approved, members can create their own
CREATE POLICY "Anyone can view approved testimonies" ON testimonies
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Members can create testimonies" ON testimonies
  FOR INSERT WITH CHECK (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Members can update own testimonies" ON testimonies
  FOR UPDATE USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all testimonies" ON testimonies
  FOR ALL USING (EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND is_admin = true));

-- Achievements: Anyone can view
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- Member achievements: Members can view their own
CREATE POLICY "Members can view own achievements" ON member_achievements
  FOR SELECT USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "System can insert achievements" ON member_achievements
  FOR INSERT WITH CHECK (true);

-- Member streaks: Members can view their own
CREATE POLICY "Members can view own streaks" ON member_streaks
  FOR SELECT USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "System can manage streaks" ON member_streaks
  FOR ALL USING (true);

-- Community groups: Public groups visible to all
CREATE POLICY "Anyone can view public groups" ON community_groups
  FOR SELECT USING (is_public = true OR leader_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Leaders can manage their groups" ON community_groups
  FOR ALL USING (leader_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all groups" ON community_groups
  FOR ALL USING (EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND is_admin = true));

-- Group members: Members can view groups they're in
CREATE POLICY "Members can view group membership" ON group_members
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid()) OR
    group_id IN (SELECT group_id FROM group_members WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid()))
  );

CREATE POLICY "Members can join groups" ON group_members
  FOR INSERT WITH CHECK (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

-- Group posts: Members can view posts in their groups
CREATE POLICY "Members can view group posts" ON group_posts
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid()))
  );

CREATE POLICY "Members can create posts in their groups" ON group_posts
  FOR INSERT WITH CHECK (
    group_id IN (SELECT group_id FROM group_members WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid()))
  );

-- Notifications: Members can only see their own
CREATE POLICY "Members can view own notifications" ON notifications
  FOR SELECT USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Members can update own notifications" ON notifications
  FOR UPDATE USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

-- Live streams: Based on tier
CREATE POLICY "Anyone can view public streams" ON live_streams
  FOR SELECT USING (is_public = true OR required_tier IS NULL);

CREATE POLICY "Admins can manage streams" ON live_streams
  FOR ALL USING (EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND is_admin = true));

-- Stream chat: Members can view and post in streams
CREATE POLICY "Anyone can view stream chat" ON stream_chat
  FOR SELECT USING (is_hidden = false);

CREATE POLICY "Members can post in chat" ON stream_chat
  FOR INSERT WITH CHECK (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

-- ============================================
-- FUNCTIONS FOR GAMIFICATION
-- ============================================

-- Function to update streak
CREATE OR REPLACE FUNCTION update_member_streak(
  p_member_id UUID,
  p_streak_type VARCHAR(50)
) RETURNS void AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  SELECT last_activity_date, current_streak, longest_streak
  INTO v_last_date, v_current_streak, v_longest_streak
  FROM member_streaks
  WHERE member_id = p_member_id AND streak_type = p_streak_type;

  IF NOT FOUND THEN
    -- First activity for this streak type
    INSERT INTO member_streaks (member_id, streak_type, current_streak, longest_streak, last_activity_date, streak_started_at)
    VALUES (p_member_id, p_streak_type, 1, 1, CURRENT_DATE, CURRENT_DATE);
  ELSIF v_last_date = CURRENT_DATE THEN
    -- Already logged today, do nothing
    NULL;
  ELSIF v_last_date = CURRENT_DATE - 1 THEN
    -- Consecutive day, increment streak
    UPDATE member_streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE member_id = p_member_id AND streak_type = p_streak_type;
  ELSE
    -- Streak broken, reset to 1
    UPDATE member_streaks
    SET current_streak = 1,
        last_activity_date = CURRENT_DATE,
        streak_started_at = CURRENT_DATE,
        updated_at = NOW()
    WHERE member_id = p_member_id AND streak_type = p_streak_type;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to award points
CREATE OR REPLACE FUNCTION award_points(
  p_member_id UUID,
  p_points INTEGER,
  p_reason VARCHAR(255),
  p_source_type VARCHAR(50),
  p_source_id UUID DEFAULT NULL
) RETURNS void AS $$
BEGIN
  -- Insert into history
  INSERT INTO points_history (member_id, points, reason, source_type, source_id)
  VALUES (p_member_id, p_points, p_reason, p_source_type, p_source_id);

  -- Update totals
  INSERT INTO member_points (member_id, total_points, points_this_month, points_this_week)
  VALUES (p_member_id, p_points, p_points, p_points)
  ON CONFLICT (member_id) DO UPDATE
  SET total_points = member_points.total_points + p_points,
      points_this_month = member_points.points_this_month + p_points,
      points_this_week = member_points.points_this_week + p_points,
      level = FLOOR(SQRT((member_points.total_points + p_points) / 100)) + 1,
      updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements(
  p_member_id UUID,
  p_category VARCHAR(50),
  p_count INTEGER DEFAULT 1
) RETURNS void AS $$
DECLARE
  v_achievement RECORD;
BEGIN
  FOR v_achievement IN
    SELECT * FROM achievements
    WHERE category = p_category
    AND is_active = true
    AND id NOT IN (SELECT achievement_id FROM member_achievements WHERE member_id = p_member_id)
  LOOP
    IF v_achievement.requirement_type = 'count' AND p_count >= v_achievement.requirement_value THEN
      -- Award achievement
      INSERT INTO member_achievements (member_id, achievement_id)
      VALUES (p_member_id, v_achievement.id)
      ON CONFLICT DO NOTHING;

      -- Award points
      PERFORM award_points(p_member_id, v_achievement.points_awarded, 'Achievement: ' || v_achievement.name, 'achievement', v_achievement.id);

      -- Create notification
      INSERT INTO notifications (member_id, title, body, notification_type, action_url)
      VALUES (p_member_id, 'Achievement Unlocked!', v_achievement.icon || ' ' || v_achievement.name || ' - ' || v_achievement.description, 'achievement', '/achievements');
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
