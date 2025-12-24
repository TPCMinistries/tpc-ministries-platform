-- Voice Messages System for TPC Ministries
-- Supports: Admin prophetic messages, member voice notes, message attachments

-- ============================================
-- VOICE MESSAGES TABLE (Admin to Members)
-- ============================================
CREATE TABLE IF NOT EXISTS voice_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Sender (admin)
  sender_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Recipient (null = group message)
  recipient_id UUID REFERENCES members(id) ON DELETE CASCADE,
  recipient_type TEXT DEFAULT 'individual' CHECK (recipient_type IN ('individual', 'group', 'tier')),
  recipient_tier TEXT CHECK (recipient_tier IN ('free', 'partner', 'covenant', 'all')),

  -- Message content
  title TEXT,
  description TEXT,
  message_type TEXT NOT NULL CHECK (message_type IN ('prayer', 'prophetic_word', 'sermon', 'message', 'encouragement', 'other')),

  -- Audio file
  audio_url TEXT NOT NULL,
  audio_duration_seconds INTEGER,

  -- Transcription (via Whisper)
  transcription TEXT,
  is_transcribed BOOLEAN DEFAULT false,

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX idx_voice_messages_recipient ON voice_messages(recipient_id);
CREATE INDEX idx_voice_messages_type ON voice_messages(message_type);
CREATE INDEX idx_voice_messages_created ON voice_messages(created_at DESC);
CREATE INDEX idx_voice_messages_group ON voice_messages(recipient_type, recipient_tier) WHERE recipient_type != 'individual';

-- ============================================
-- MEMBER VOICE NOTES TABLE (User recordings)
-- ============================================
CREATE TABLE IF NOT EXISTS member_voice_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Owner
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Context (where was this recorded)
  context_type TEXT NOT NULL CHECK (context_type IN ('devotional', 'journal', 'prayer', 'testimony', 'other')),
  context_id UUID, -- e.g., devotional_id, journal_entry_id, etc.
  context_date DATE, -- For devotionals tied to a specific date

  -- Audio file
  audio_url TEXT NOT NULL,
  audio_duration_seconds INTEGER,

  -- Transcription (via Whisper)
  transcription TEXT,
  is_transcribed BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX idx_member_voice_notes_member ON member_voice_notes(member_id);
CREATE INDEX idx_member_voice_notes_context ON member_voice_notes(context_type, context_date);

-- ============================================
-- ADD VOICE TO MESSAGES TABLE
-- ============================================
DO $$
BEGIN
  -- Add voice_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'messages' AND column_name = 'voice_url') THEN
    ALTER TABLE messages ADD COLUMN voice_url TEXT;
  END IF;

  -- Add voice_duration column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'messages' AND column_name = 'voice_duration_seconds') THEN
    ALTER TABLE messages ADD COLUMN voice_duration_seconds INTEGER;
  END IF;

  -- Add voice_transcription column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'messages' AND column_name = 'voice_transcription') THEN
    ALTER TABLE messages ADD COLUMN voice_transcription TEXT;
  END IF;
END $$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Voice Messages RLS
ALTER TABLE voice_messages ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage voice messages" ON voice_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.user_id = auth.uid()
      AND members.is_admin = true
    )
  );

-- Members can view their own messages
CREATE POLICY "Members can view their voice messages" ON voice_messages
  FOR SELECT
  TO authenticated
  USING (
    recipient_id = (SELECT id FROM members WHERE user_id = auth.uid())
    OR recipient_type = 'group'
    OR (recipient_type = 'tier' AND recipient_tier IN (
      SELECT tier FROM members WHERE user_id = auth.uid()
    ))
    OR recipient_tier = 'all'
  );

-- Member Voice Notes RLS
ALTER TABLE member_voice_notes ENABLE ROW LEVEL SECURITY;

-- Members can manage their own voice notes
CREATE POLICY "Members can manage their voice notes" ON member_voice_notes
  FOR ALL
  TO authenticated
  USING (member_id = (SELECT id FROM members WHERE user_id = auth.uid()));

-- Admins can view all voice notes
CREATE POLICY "Admins can view all voice notes" ON member_voice_notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.user_id = auth.uid()
      AND members.is_admin = true
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to mark voice message as read
CREATE OR REPLACE FUNCTION mark_voice_message_read(message_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE voice_messages
  SET is_read = true, read_at = NOW()
  WHERE id = message_id
  AND recipient_id = (SELECT id FROM members WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread voice message count
CREATE OR REPLACE FUNCTION get_unread_voice_count()
RETURNS INTEGER AS $$
DECLARE
  member_record RECORD;
  count INTEGER;
BEGIN
  SELECT id, tier INTO member_record FROM members WHERE user_id = auth.uid();

  SELECT COUNT(*) INTO count
  FROM voice_messages
  WHERE is_read = false
  AND (
    recipient_id = member_record.id
    OR recipient_type = 'group'
    OR (recipient_type = 'tier' AND (recipient_tier = member_record.tier OR recipient_tier = 'all'))
  );

  RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
