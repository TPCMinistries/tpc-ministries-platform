-- =====================================================
-- TPC Ministries - Complete Messaging System
-- Creates all tables needed for email, SMS, and internal messaging
-- =====================================================

-- ============================================
-- 1. INBOX EMAILS TABLE
-- Stores incoming and received emails
-- ============================================
CREATE TABLE IF NOT EXISTS inbox_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Email metadata
  message_id TEXT UNIQUE, -- Resend message ID
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  reply_to TEXT,
  subject TEXT,

  -- Content
  body_text TEXT,
  body_html TEXT,

  -- Attachments (stored as JSON array)
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Status flags
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  is_trash BOOLEAN DEFAULT false,
  folder TEXT DEFAULT 'inbox' CHECK (folder IN ('inbox', 'sent', 'starred', 'archive', 'trash')),

  -- Labels/tags
  labels TEXT[] DEFAULT '{}',

  -- Related member (if matched)
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,

  -- Threading
  thread_id TEXT,
  in_reply_to TEXT,

  -- Timestamps
  received_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for inbox_emails
CREATE INDEX IF NOT EXISTS idx_inbox_emails_folder ON inbox_emails(folder);
CREATE INDEX IF NOT EXISTS idx_inbox_emails_from ON inbox_emails(from_email);
CREATE INDEX IF NOT EXISTS idx_inbox_emails_member ON inbox_emails(member_id);
CREATE INDEX IF NOT EXISTS idx_inbox_emails_unread ON inbox_emails(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_inbox_emails_starred ON inbox_emails(is_starred) WHERE is_starred = true;
CREATE INDEX IF NOT EXISTS idx_inbox_emails_thread ON inbox_emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_inbox_emails_received ON inbox_emails(received_at DESC);

-- ============================================
-- 2. SENT EMAILS TABLE
-- Stores outgoing/sent emails
-- ============================================
CREATE TABLE IF NOT EXISTS sent_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Resend tracking
  resend_id TEXT,
  resend_status TEXT DEFAULT 'pending' CHECK (resend_status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'failed')),

  -- Email metadata
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  to_name TEXT,
  reply_to TEXT,
  subject TEXT NOT NULL,

  -- Content
  body_text TEXT,
  body_html TEXT,
  template_id TEXT,
  template_data JSONB,

  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Related records
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  sent_by UUID REFERENCES members(id) ON DELETE SET NULL, -- Admin who sent it

  -- Reply tracking
  in_reply_to UUID REFERENCES inbox_emails(id) ON DELETE SET NULL,
  thread_id TEXT,

  -- Timestamps
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sent_emails
CREATE INDEX IF NOT EXISTS idx_sent_emails_to ON sent_emails(to_email);
CREATE INDEX IF NOT EXISTS idx_sent_emails_member ON sent_emails(member_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_sent_by ON sent_emails(sent_by);
CREATE INDEX IF NOT EXISTS idx_sent_emails_status ON sent_emails(resend_status);
CREATE INDEX IF NOT EXISTS idx_sent_emails_sent_at ON sent_emails(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_sent_emails_thread ON sent_emails(thread_id);

-- ============================================
-- 3. SMS CONVERSATIONS TABLE
-- Groups SMS messages by phone number
-- ============================================
CREATE TABLE IF NOT EXISTS sms_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Phone number (E.164 format)
  phone_number TEXT NOT NULL UNIQUE,

  -- Contact info (if matched to member)
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  contact_name TEXT,

  -- Conversation metadata
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,
  last_message_direction TEXT CHECK (last_message_direction IN ('inbound', 'outbound')),

  -- Status
  unread_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sms_conversations
CREATE INDEX IF NOT EXISTS idx_sms_conversations_phone ON sms_conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_member ON sms_conversations(member_id);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_last_message ON sms_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_unread ON sms_conversations(unread_count) WHERE unread_count > 0;

-- ============================================
-- 4. SMS MESSAGES TABLE
-- Individual SMS messages
-- ============================================
CREATE TABLE IF NOT EXISTS sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Conversation reference
  conversation_id UUID NOT NULL REFERENCES sms_conversations(id) ON DELETE CASCADE,

  -- Twilio tracking
  twilio_sid TEXT UNIQUE,
  twilio_status TEXT DEFAULT 'pending' CHECK (twilio_status IN ('pending', 'queued', 'sending', 'sent', 'delivered', 'undelivered', 'failed', 'received')),

  -- Message details
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  body TEXT NOT NULL,

  -- Media (MMS)
  media_urls TEXT[],
  num_media INTEGER DEFAULT 0,

  -- Metadata
  num_segments INTEGER DEFAULT 1,
  error_code TEXT,
  error_message TEXT,

  -- Sent by (for outbound)
  sent_by UUID REFERENCES members(id) ON DELETE SET NULL,

  -- Timestamps
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sms_messages
CREATE INDEX IF NOT EXISTS idx_sms_messages_conversation ON sms_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_twilio_sid ON sms_messages(twilio_sid);
CREATE INDEX IF NOT EXISTS idx_sms_messages_direction ON sms_messages(direction);
CREATE INDEX IF NOT EXISTS idx_sms_messages_created ON sms_messages(created_at DESC);

-- ============================================
-- 5. ADMIN MEMBER CONVERSATIONS TABLE
-- For admin-initiated conversations with members
-- ============================================
CREATE TABLE IF NOT EXISTS admin_member_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Participants
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Conversation metadata
  subject TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,
  last_message_by TEXT CHECK (last_message_by IN ('admin', 'member')),

  -- Status
  admin_unread_count INTEGER DEFAULT 0,
  member_unread_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  is_closed BOOLEAN DEFAULT false,

  -- Priority/category
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category TEXT CHECK (category IN ('general', 'prayer', 'counseling', 'prophetic', 'support', 'other')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint per member-admin pair
  UNIQUE(member_id, admin_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_member_conv_member ON admin_member_conversations(member_id);
CREATE INDEX IF NOT EXISTS idx_admin_member_conv_admin ON admin_member_conversations(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_member_conv_last ON admin_member_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_member_conv_unread ON admin_member_conversations(admin_unread_count) WHERE admin_unread_count > 0;

-- ============================================
-- 6. UPDATE MESSAGES TABLE
-- Add admin support to existing messages table
-- ============================================
DO $$
BEGIN
  -- Add admin_id column for admin-sent messages
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'messages' AND column_name = 'admin_id') THEN
    ALTER TABLE messages ADD COLUMN admin_id UUID REFERENCES members(id) ON DELETE SET NULL;
  END IF;

  -- Add conversation_ref to link to admin_member_conversations
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'messages' AND column_name = 'admin_conversation_id') THEN
    ALTER TABLE messages ADD COLUMN admin_conversation_id UUID REFERENCES admin_member_conversations(id) ON DELETE CASCADE;
  END IF;

  -- Add priority column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'messages' AND column_name = 'priority') THEN
    ALTER TABLE messages ADD COLUMN priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
  END IF;

  -- Add attachments support
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'messages' AND column_name = 'attachments') THEN
    ALTER TABLE messages ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- ============================================
-- 7. ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE inbox_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_member_conversations ENABLE ROW LEVEL SECURITY;

-- Inbox Emails: Admin only
CREATE POLICY "Admins can manage inbox emails" ON inbox_emails
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM members WHERE members.user_id = auth.uid() AND members.is_admin = true
  ));

-- Sent Emails: Admin only
CREATE POLICY "Admins can manage sent emails" ON sent_emails
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM members WHERE members.user_id = auth.uid() AND members.is_admin = true
  ));

-- SMS Conversations: Admin only
CREATE POLICY "Admins can manage SMS conversations" ON sms_conversations
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM members WHERE members.user_id = auth.uid() AND members.is_admin = true
  ));

-- SMS Messages: Admin only
CREATE POLICY "Admins can manage SMS messages" ON sms_messages
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM members WHERE members.user_id = auth.uid() AND members.is_admin = true
  ));

-- Admin Member Conversations: Admins and related members
CREATE POLICY "Admins can manage all conversations" ON admin_member_conversations
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM members WHERE members.user_id = auth.uid() AND members.is_admin = true
  ));

CREATE POLICY "Members can view their conversations" ON admin_member_conversations
  FOR SELECT TO authenticated
  USING (member_id = (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Members can update their conversation read status" ON admin_member_conversations
  FOR UPDATE TO authenticated
  USING (member_id = (SELECT id FROM members WHERE user_id = auth.uid()))
  WITH CHECK (member_id = (SELECT id FROM members WHERE user_id = auth.uid()));

-- Update messages table policy for admin messages
DROP POLICY IF EXISTS "Admins can send messages to members" ON messages;
CREATE POLICY "Admins can send messages to members" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members WHERE members.user_id = auth.uid() AND members.is_admin = true
    )
    OR
    auth.uid() IN (SELECT user_id FROM members WHERE id = sender_id)
  );

DROP POLICY IF EXISTS "Admins can view all messages" ON messages;
CREATE POLICY "Admins can view all messages" ON messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members WHERE members.user_id = auth.uid() AND members.is_admin = true
    )
    OR
    auth.uid() IN (SELECT user_id FROM members WHERE id IN (sender_id, recipient_id))
  );

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Function to get or create SMS conversation
CREATE OR REPLACE FUNCTION get_or_create_sms_conversation(
  p_phone_number TEXT,
  p_contact_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_member_id UUID;
BEGIN
  -- Try to find existing conversation
  SELECT id INTO v_conversation_id
  FROM sms_conversations
  WHERE phone_number = p_phone_number;

  IF v_conversation_id IS NULL THEN
    -- Try to match phone to member
    SELECT id INTO v_member_id
    FROM members
    WHERE phone = p_phone_number OR phone = REPLACE(REPLACE(REPLACE(p_phone_number, '+1', ''), '-', ''), ' ', '');

    -- Create new conversation
    INSERT INTO sms_conversations (phone_number, member_id, contact_name)
    VALUES (p_phone_number, v_member_id, COALESCE(p_contact_name, 'Unknown'))
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update conversation on new message
CREATE OR REPLACE FUNCTION update_sms_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE sms_conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.body, 100),
    last_message_direction = NEW.direction,
    unread_count = CASE WHEN NEW.direction = 'inbound' THEN unread_count + 1 ELSE unread_count END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for SMS conversation updates
DROP TRIGGER IF EXISTS trg_update_sms_conversation ON sms_messages;
CREATE TRIGGER trg_update_sms_conversation
  AFTER INSERT ON sms_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_sms_conversation_on_message();

-- Function to update admin_member_conversations on new message
CREATE OR REPLACE FUNCTION update_admin_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.admin_conversation_id IS NOT NULL THEN
    UPDATE admin_member_conversations
    SET
      last_message_at = NEW.created_at,
      last_message_preview = LEFT(COALESCE(NEW.message, NEW.voice_transcription, '[Voice Message]'), 100),
      last_message_by = NEW.sender_type,
      admin_unread_count = CASE WHEN NEW.sender_type = 'member' THEN admin_unread_count + 1 ELSE admin_unread_count END,
      member_unread_count = CASE WHEN NEW.sender_type = 'admin' THEN member_unread_count + 1 ELSE member_unread_count END,
      updated_at = NOW()
    WHERE id = NEW.admin_conversation_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for admin conversation updates
DROP TRIGGER IF EXISTS trg_update_admin_conversation ON messages;
CREATE TRIGGER trg_update_admin_conversation
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_conversation_on_message();

-- Function to get unread message counts for admin dashboard
CREATE OR REPLACE FUNCTION get_admin_unread_counts()
RETURNS TABLE (
  inbox_emails_unread BIGINT,
  sms_unread BIGINT,
  member_messages_unread BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM inbox_emails WHERE is_read = false AND folder = 'inbox'),
    (SELECT COALESCE(SUM(unread_count), 0) FROM sms_conversations WHERE is_archived = false),
    (SELECT COALESCE(SUM(admin_unread_count), 0) FROM admin_member_conversations WHERE is_archived = false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. VIEWS FOR EASY QUERYING
-- ============================================

-- View for inbox with member info
CREATE OR REPLACE VIEW inbox_emails_with_member AS
SELECT
  e.*,
  m.first_name,
  m.last_name,
  m.tier as member_tier,
  m.profile_image_url
FROM inbox_emails e
LEFT JOIN members m ON e.member_id = m.id;

-- View for SMS conversations with member info
CREATE OR REPLACE VIEW sms_conversations_with_member AS
SELECT
  c.*,
  m.first_name,
  m.last_name,
  m.email,
  m.tier as member_tier,
  m.profile_image_url
FROM sms_conversations c
LEFT JOIN members m ON c.member_id = m.id;

-- View for admin-member conversations with details
CREATE OR REPLACE VIEW admin_member_conversations_view AS
SELECT
  c.*,
  m.first_name as member_first_name,
  m.last_name as member_last_name,
  m.email as member_email,
  m.tier as member_tier,
  m.profile_image_url as member_image,
  a.first_name as admin_first_name,
  a.last_name as admin_last_name
FROM admin_member_conversations c
JOIN members m ON c.member_id = m.id
JOIN members a ON c.admin_id = a.id;

-- ============================================
-- DONE!
-- ============================================
SELECT 'Complete messaging system tables created successfully!' as result;
