-- ============================================
-- AI SYSTEM TABLES
-- Track member activity, AI conversations, and insights
-- ============================================

-- ============================================
-- MEMBER ACTIVITY TRACKING
-- Tracks all member interactions for AI insights
-- ============================================
CREATE TABLE IF NOT EXISTS member_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  -- Activity type
  activity_type VARCHAR(50) NOT NULL, -- 'page_view', 'content_read', 'prayer_submitted', 'journal_entry', 'assessment_completed', 'course_progress', 'devotional_read', 'prophecy_viewed', 'ai_chat', 'giving'
  -- What they interacted with
  resource_type VARCHAR(50), -- 'devotional', 'course', 'lesson', 'prayer', 'journal', 'prophecy', 'assessment', 'event', 'resource'
  resource_id UUID,
  resource_name VARCHAR(255),
  -- Context
  page_path VARCHAR(255),
  duration_seconds INTEGER, -- time spent
  -- Metadata for AI analysis
  metadata JSONB DEFAULT '{}', -- flexible storage for activity-specific data
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_member_activity_member ON member_activity(member_id);
CREATE INDEX idx_member_activity_type ON member_activity(activity_type);
CREATE INDEX idx_member_activity_created ON member_activity(created_at DESC);

-- ============================================
-- AI CHAT CONVERSATIONS (Prophet Lorenzo Bot)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  -- Conversation metadata
  title VARCHAR(255), -- auto-generated from first message
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived'
  -- AI context - stores member context for personalized responses
  member_context JSONB DEFAULT '{}', -- spiritual journey, interests, prayer themes, etc.
  -- Stats
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_member ON ai_conversations(member_id);

-- ============================================
-- AI CHAT MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  -- Message content
  role VARCHAR(20) NOT NULL, -- 'user', 'assistant'
  content TEXT NOT NULL,
  -- AI metadata
  tokens_used INTEGER,
  model_used VARCHAR(50),
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_member ON ai_messages(member_id);

-- ============================================
-- MEMBER INSIGHTS (AI-Generated)
-- Periodic insights about each member for admin
-- ============================================
CREATE TABLE IF NOT EXISTS member_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  -- Insight type
  insight_type VARCHAR(50) NOT NULL, -- 'engagement_summary', 'spiritual_growth', 'interests', 'prayer_themes', 'recommendations', 'weekly_digest'
  -- Insight content
  title VARCHAR(255),
  summary TEXT,
  details JSONB DEFAULT '{}', -- structured insight data
  -- Scoring
  engagement_score INTEGER, -- 0-100
  growth_indicators JSONB DEFAULT '[]', -- areas of growth
  areas_of_interest TEXT[], -- topics they engage with most
  recommended_content JSONB DEFAULT '[]', -- AI recommendations
  -- Period
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  -- Timestamps
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- when to regenerate
);

CREATE INDEX idx_member_insights_member ON member_insights(member_id);
CREATE INDEX idx_member_insights_type ON member_insights(insight_type);

-- ============================================
-- MEMBER SPIRITUAL PROFILE (AI-Enhanced)
-- Aggregated spiritual data for personalization
-- ============================================
CREATE TABLE IF NOT EXISTS member_spiritual_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE UNIQUE,
  -- Spiritual Gifts (from assessments)
  primary_gift VARCHAR(100),
  secondary_gifts TEXT[],
  gift_scores JSONB DEFAULT '{}',
  -- Current Season
  current_season VARCHAR(100),
  season_started_at TIMESTAMPTZ,
  -- Prayer Patterns
  prayer_frequency VARCHAR(50), -- 'daily', 'weekly', 'occasional'
  common_prayer_themes TEXT[],
  answered_prayers_count INTEGER DEFAULT 0,
  -- Journal Patterns
  journal_frequency VARCHAR(50),
  common_journal_themes TEXT[],
  emotional_patterns JSONB DEFAULT '{}', -- mood trends
  -- Learning Progress
  courses_completed INTEGER DEFAULT 0,
  current_learning_focus TEXT[],
  learning_style VARCHAR(50), -- 'visual', 'reading', 'interactive'
  -- Engagement Metrics
  total_devotionals_read INTEGER DEFAULT 0,
  consecutive_devotional_days INTEGER DEFAULT 0,
  total_prayers_submitted INTEGER DEFAULT 0,
  total_journal_entries INTEGER DEFAULT 0,
  -- AI-Generated Summary
  spiritual_journey_summary TEXT,
  growth_areas TEXT[],
  strengths TEXT[],
  -- Last updated
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_spiritual_profiles_member ON member_spiritual_profiles(member_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE member_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_spiritual_profiles ENABLE ROW LEVEL SECURITY;

-- Members can only see their own data
CREATE POLICY "Members can view own activity" ON member_activity
  FOR SELECT USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Members can insert own activity" ON member_activity
  FOR INSERT WITH CHECK (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Members can view own conversations" ON ai_conversations
  FOR ALL USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Members can view own messages" ON ai_messages
  FOR ALL USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Members can view own spiritual profile" ON member_spiritual_profiles
  FOR SELECT USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

-- Admins can view all insights
CREATE POLICY "Admins can view all insights" ON member_insights
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND is_admin = true)
  );

-- ============================================
-- FUNCTION: Update spiritual profile on activity
-- ============================================
CREATE OR REPLACE FUNCTION update_spiritual_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile if doesn't exist
  INSERT INTO member_spiritual_profiles (member_id)
  VALUES (NEW.member_id)
  ON CONFLICT (member_id) DO NOTHING;

  -- Update stats based on activity type
  IF NEW.activity_type = 'devotional_read' THEN
    UPDATE member_spiritual_profiles SET
      total_devotionals_read = total_devotionals_read + 1,
      updated_at = NOW()
    WHERE member_id = NEW.member_id;
  ELSIF NEW.activity_type = 'prayer_submitted' THEN
    UPDATE member_spiritual_profiles SET
      total_prayers_submitted = total_prayers_submitted + 1,
      updated_at = NOW()
    WHERE member_id = NEW.member_id;
  ELSIF NEW.activity_type = 'journal_entry' THEN
    UPDATE member_spiritual_profiles SET
      total_journal_entries = total_journal_entries + 1,
      updated_at = NOW()
    WHERE member_id = NEW.member_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_spiritual_profile
AFTER INSERT ON member_activity
FOR EACH ROW EXECUTE FUNCTION update_spiritual_profile_stats();

-- ============================================
-- FUNCTION: Update conversation stats
-- ============================================
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_conversations SET
    message_count = message_count + 1,
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_conversation_stats
AFTER INSERT ON ai_messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_stats();
