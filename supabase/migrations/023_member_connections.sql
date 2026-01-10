-- Member Connections Feature
-- Allows members to connect/follow each other and send encouragement

-- Member connections table (follow relationship)
CREATE TABLE IF NOT EXISTS member_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Member encouragements (short messages between members)
CREATE TABLE IF NOT EXISTS member_encouragements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_member_connections_follower ON member_connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_member_connections_following ON member_connections(following_id);
CREATE INDEX IF NOT EXISTS idx_member_encouragements_recipient ON member_encouragements(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_member_encouragements_sender ON member_encouragements(sender_id);

-- RLS Policies
ALTER TABLE member_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_encouragements ENABLE ROW LEVEL SECURITY;

-- Connections: Anyone can view connections (public)
CREATE POLICY "View all connections"
  ON member_connections FOR SELECT
  USING (true);

-- Connections: Members can create their own connections
CREATE POLICY "Create own connections"
  ON member_connections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = member_connections.follower_id
      AND m.user_id = auth.uid()
    )
  );

-- Connections: Members can delete their own connections (unfollow)
CREATE POLICY "Delete own connections"
  ON member_connections FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = member_connections.follower_id
      AND m.user_id = auth.uid()
    )
  );

-- Encouragements: Recipients can view their encouragements
CREATE POLICY "View received encouragements"
  ON member_encouragements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = member_encouragements.recipient_id
      AND m.user_id = auth.uid()
    )
  );

-- Encouragements: Senders can view their sent encouragements
CREATE POLICY "View sent encouragements"
  ON member_encouragements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = member_encouragements.sender_id
      AND m.user_id = auth.uid()
    )
  );

-- Encouragements: Members can send encouragements
CREATE POLICY "Send encouragements"
  ON member_encouragements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = member_encouragements.sender_id
      AND m.user_id = auth.uid()
    )
  );

-- Encouragements: Recipients can update (mark as read)
CREATE POLICY "Update received encouragements"
  ON member_encouragements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = member_encouragements.recipient_id
      AND m.user_id = auth.uid()
    )
  );

-- Encouragements: Senders can delete their own
CREATE POLICY "Delete own encouragements"
  ON member_encouragements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = member_encouragements.sender_id
      AND m.user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT ALL ON member_connections TO authenticated;
GRANT ALL ON member_encouragements TO authenticated;

-- Add public profile fields to members if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'bio') THEN
    ALTER TABLE members ADD COLUMN bio TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'is_profile_public') THEN
    ALTER TABLE members ADD COLUMN is_profile_public BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'show_badges') THEN
    ALTER TABLE members ADD COLUMN show_badges BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Function to get member stats (followers, following, badges)
CREATE OR REPLACE FUNCTION get_member_profile_stats(p_member_id UUID)
RETURNS TABLE (
  followers_count BIGINT,
  following_count BIGINT,
  badges_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM member_connections WHERE following_id = p_member_id) as followers_count,
    (SELECT COUNT(*) FROM member_connections WHERE follower_id = p_member_id) as following_count,
    (SELECT COUNT(*) FROM member_badges WHERE member_id = p_member_id) as badges_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log connection activity
CREATE OR REPLACE FUNCTION on_member_connection()
RETURNS TRIGGER AS $$
DECLARE
  v_follower_name TEXT;
  v_following_name TEXT;
BEGIN
  -- Get names
  SELECT first_name || ' ' || last_name INTO v_follower_name FROM members WHERE id = NEW.follower_id;
  SELECT first_name || ' ' || last_name INTO v_following_name FROM members WHERE id = NEW.following_id;

  -- Log activity for the person being followed (they got a new follower)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_activity') THEN
    INSERT INTO community_activity (member_id, activity_type, title, metadata, is_public)
    VALUES (
      NEW.following_id,
      'follower_gained',
      'Gained a new connection',
      jsonb_build_object('follower_id', NEW.follower_id, 'follower_name', v_follower_name),
      false -- Keep this private
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for connection
DROP TRIGGER IF EXISTS trigger_member_connection ON member_connections;
CREATE TRIGGER trigger_member_connection
  AFTER INSERT ON member_connections
  FOR EACH ROW
  EXECUTE FUNCTION on_member_connection();
