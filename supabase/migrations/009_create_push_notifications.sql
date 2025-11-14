-- Create push_subscriptions table for storing browser push notification subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL, -- Contains p256dh and auth keys
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, endpoint)
);

-- Create notifications table for storing notification history
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  icon TEXT,
  url TEXT,
  type VARCHAR(50), -- 'message', 'prophecy', 'event', 'teaching', 'announcement'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_member ON push_subscriptions(member_id);
CREATE INDEX IF NOT EXISTS idx_notifications_member ON notifications(member_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for push_subscriptions
-- Members can manage their own subscriptions
CREATE POLICY "Members can view own subscriptions"
  ON push_subscriptions FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create own subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Members can delete own subscriptions"
  ON push_subscriptions FOR DELETE
  USING (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions"
  ON push_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.auth_user_id = auth.uid()
      AND members.role = 'admin'
    )
  );

-- RLS Policies for notifications
-- Members can view their own notifications
CREATE POLICY "Members can view own notifications"
  ON notifications FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );

-- Members can update their own notifications (mark as read)
CREATE POLICY "Members can update own notifications"
  ON notifications FOR UPDATE
  USING (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );

-- Admins can create notifications for any member
CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.auth_user_id = auth.uid()
      AND members.role = 'admin'
    )
  );

-- System can create notifications (for automated triggers)
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Add comments
COMMENT ON TABLE push_subscriptions IS 'Browser push notification subscriptions';
COMMENT ON TABLE notifications IS 'Notification history for members';
