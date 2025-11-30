-- AI-Enhanced Spiritual Journal Tables
-- For voice notes, reflections, prayers, and AI-powered insights

-- ============================================
-- JOURNAL ENTRIES
-- ============================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,

  -- Entry type
  entry_type VARCHAR(50) DEFAULT 'reflection', -- 'reflection', 'prayer', 'gratitude', 'voice', 'prophecy_response'

  -- Content
  title VARCHAR(255),
  content TEXT, -- Written content
  transcription TEXT, -- Voice note transcription
  audio_url TEXT, -- URL to audio file if voice note
  audio_duration INTEGER, -- Duration in seconds

  -- AI-generated content
  ai_summary TEXT,
  ai_insights JSONB, -- {themes, scriptures, reflectionPrompts, actionSteps}
  ai_suggested_prayer TEXT,

  -- Metadata
  scripture_references TEXT[],
  mood VARCHAR(50), -- 'grateful', 'peaceful', 'joyful', 'hopeful', 'struggling', 'anxious', 'seeking'
  tags TEXT[],

  -- Related content
  related_prophecy_id UUID,
  related_devotional_date DATE,

  -- Privacy
  is_private BOOLEAN DEFAULT true,
  is_answered BOOLEAN DEFAULT false, -- For prayer entries
  answered_date DATE,
  answered_testimony TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOURNAL PROMPTS (AI-generated daily prompts)
-- ============================================
CREATE TABLE IF NOT EXISTS journal_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_date DATE UNIQUE,
  prompt_text TEXT NOT NULL,
  scripture_reference TEXT,
  category VARCHAR(50), -- 'reflection', 'gratitude', 'prayer', 'action'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOURNAL STREAKS
-- ============================================
CREATE TABLE IF NOT EXISTS journal_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_entries INTEGER DEFAULT 0,
  last_entry_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_journal_entries_member ON journal_entries(member_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_type ON journal_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_mood ON journal_entries(mood);
CREATE INDEX IF NOT EXISTS idx_journal_prompts_date ON journal_prompts(prompt_date);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_streaks ENABLE ROW LEVEL SECURITY;

-- Journal entries - members can only see their own
CREATE POLICY "Members can view their own journal entries" ON journal_entries
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can create their own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can update their own journal entries" ON journal_entries
  FOR UPDATE USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can delete their own journal entries" ON journal_entries
  FOR DELETE USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- Journal prompts - everyone can read
CREATE POLICY "Anyone can view journal prompts" ON journal_prompts
  FOR SELECT USING (true);

-- Journal streaks - members can only see their own
CREATE POLICY "Members can view their own streaks" ON journal_streaks
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can manage their own streaks" ON journal_streaks
  FOR ALL USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- ============================================
-- TRIGGER: Update journal streak on new entry
-- ============================================
CREATE OR REPLACE FUNCTION update_journal_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  -- Get current streak data
  SELECT last_entry_date, current_streak, longest_streak
  INTO v_last_date, v_current_streak, v_longest_streak
  FROM journal_streaks
  WHERE member_id = NEW.member_id;

  IF NOT FOUND THEN
    -- Create new streak record
    INSERT INTO journal_streaks (member_id, current_streak, longest_streak, total_entries, last_entry_date)
    VALUES (NEW.member_id, 1, 1, 1, CURRENT_DATE);
  ELSE
    -- Update existing streak
    IF v_last_date = CURRENT_DATE THEN
      -- Already journaled today, just increment total
      UPDATE journal_streaks SET
        total_entries = total_entries + 1,
        updated_at = NOW()
      WHERE member_id = NEW.member_id;
    ELSIF v_last_date = CURRENT_DATE - 1 THEN
      -- Consecutive day, extend streak
      UPDATE journal_streaks SET
        current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        total_entries = total_entries + 1,
        last_entry_date = CURRENT_DATE,
        updated_at = NOW()
      WHERE member_id = NEW.member_id;
    ELSE
      -- Streak broken, reset to 1
      UPDATE journal_streaks SET
        current_streak = 1,
        total_entries = total_entries + 1,
        last_entry_date = CURRENT_DATE,
        updated_at = NOW()
      WHERE member_id = NEW.member_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_journal_streak
AFTER INSERT ON journal_entries
FOR EACH ROW EXECUTE FUNCTION update_journal_streak();

-- ============================================
-- SAMPLE PROMPTS
-- ============================================
INSERT INTO journal_prompts (prompt_date, prompt_text, scripture_reference, category)
VALUES
  (CURRENT_DATE, 'What is God teaching you in this current season of your life?', 'Ecclesiastes 3:1', 'reflection'),
  (CURRENT_DATE + 1, 'List three things you are grateful for today and why.', 'Psalm 100:4', 'gratitude'),
  (CURRENT_DATE + 2, 'What area of your life needs more of God''s peace right now?', 'Philippians 4:6-7', 'prayer'),
  (CURRENT_DATE + 3, 'How can you be a blessing to someone this week?', 'Galatians 6:10', 'action'),
  (CURRENT_DATE + 4, 'Reflect on a time when God answered a prayer. How did it strengthen your faith?', 'Psalm 34:4', 'reflection'),
  (CURRENT_DATE + 5, 'What fears or worries do you need to surrender to God today?', '1 Peter 5:7', 'prayer'),
  (CURRENT_DATE + 6, 'How have you seen God''s faithfulness in your life recently?', 'Lamentations 3:22-23', 'gratitude')
ON CONFLICT (prompt_date) DO NOTHING;

COMMIT;
