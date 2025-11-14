-- Create messages table for two-way communication between admin and members
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('member', 'admin')),
  recipient_id UUID REFERENCES members(id) ON DELETE CASCADE,
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('member', 'admin')),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_unread ON messages(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_messages_recipient_type ON messages(recipient_type);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view messages where they are sender or recipient
CREATE POLICY "Members can view their own messages"
  ON messages
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM members WHERE id = sender_id
    )
    OR
    auth.uid() IN (
      SELECT user_id FROM members WHERE id = recipient_id
    )
  );

-- Policy: Members can send messages (insert)
CREATE POLICY "Members can send messages"
  ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM members WHERE id = sender_id
    )
  );

-- Policy: Members and admins can mark messages as read (update)
CREATE POLICY "Users can mark messages as read"
  ON messages
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM members WHERE id = recipient_id
    )
    OR
    recipient_type = 'admin'
  );

-- Comment on table
COMMENT ON TABLE messages IS 'Two-way messaging system between members and admin/leadership';
COMMENT ON COLUMN messages.conversation_id IS 'Groups messages into conversation threads';
COMMENT ON COLUMN messages.sender_type IS 'Type of sender: member or admin';
COMMENT ON COLUMN messages.recipient_type IS 'Type of recipient: member or admin';
COMMENT ON COLUMN messages.subject IS 'Subject line - only set on first message of conversation';
