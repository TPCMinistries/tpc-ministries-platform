-- Group Discussions Feature
-- Allows members to have threaded discussions within groups

-- Main discussions table
CREATE TABLE IF NOT EXISTS group_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  reply_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discussion replies table
CREATE TABLE IF NOT EXISTS group_discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID NOT NULL REFERENCES group_discussions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_reply_id UUID REFERENCES group_discussion_replies(id) ON DELETE CASCADE,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_discussions_group_id ON group_discussions(group_id);
CREATE INDEX IF NOT EXISTS idx_group_discussions_member_id ON group_discussions(member_id);
CREATE INDEX IF NOT EXISTS idx_group_discussions_last_activity ON group_discussions(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_discussions_pinned ON group_discussions(group_id, is_pinned DESC, last_activity_at DESC);

CREATE INDEX IF NOT EXISTS idx_group_discussion_replies_discussion_id ON group_discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_group_discussion_replies_member_id ON group_discussion_replies(member_id);
CREATE INDEX IF NOT EXISTS idx_group_discussion_replies_parent ON group_discussion_replies(parent_reply_id);

-- Function to update reply count and last activity
CREATE OR REPLACE FUNCTION update_discussion_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE group_discussions
    SET reply_count = reply_count + 1,
        last_activity_at = NOW(),
        updated_at = NOW()
    WHERE id = NEW.discussion_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE group_discussions
    SET reply_count = GREATEST(0, reply_count - 1),
        updated_at = NOW()
    WHERE id = OLD.discussion_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update discussion stats on reply changes
DROP TRIGGER IF EXISTS trigger_update_discussion_stats ON group_discussion_replies;
CREATE TRIGGER trigger_update_discussion_stats
  AFTER INSERT OR DELETE ON group_discussion_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_discussion_stats();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_discussion_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_discussion_updated_at ON group_discussions;
CREATE TRIGGER trigger_discussion_updated_at
  BEFORE UPDATE ON group_discussions
  FOR EACH ROW
  EXECUTE FUNCTION update_discussion_updated_at();

DROP TRIGGER IF EXISTS trigger_reply_updated_at ON group_discussion_replies;
CREATE TRIGGER trigger_reply_updated_at
  BEFORE UPDATE ON group_discussion_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_discussion_updated_at();

-- RLS Policies
ALTER TABLE group_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_discussion_replies ENABLE ROW LEVEL SECURITY;

-- Discussions: Members can view discussions in groups they belong to
CREATE POLICY "Members can view group discussions"
  ON group_discussions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      JOIN members m ON m.id = gm.member_id
      WHERE gm.group_id = group_discussions.group_id
      AND m.user_id = auth.uid()
    )
  );

-- Discussions: Members can create discussions in groups they belong to
CREATE POLICY "Members can create discussions in their groups"
  ON group_discussions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members gm
      JOIN members m ON m.id = gm.member_id
      WHERE gm.group_id = group_discussions.group_id
      AND m.user_id = auth.uid()
      AND m.id = group_discussions.member_id
    )
  );

-- Discussions: Authors can update their own discussions
CREATE POLICY "Authors can update their discussions"
  ON group_discussions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = group_discussions.member_id
      AND m.user_id = auth.uid()
    )
  );

-- Discussions: Authors and group admins can delete discussions
CREATE POLICY "Authors and admins can delete discussions"
  ON group_discussions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = group_discussions.member_id
      AND m.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM group_members gm
      JOIN members m ON m.id = gm.member_id
      WHERE gm.group_id = group_discussions.group_id
      AND m.user_id = auth.uid()
      AND gm.role IN ('admin', 'leader')
    )
  );

-- Replies: Members can view replies in groups they belong to
CREATE POLICY "Members can view discussion replies"
  ON group_discussion_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_discussions gd
      JOIN group_members gm ON gm.group_id = gd.group_id
      JOIN members m ON m.id = gm.member_id
      WHERE gd.id = group_discussion_replies.discussion_id
      AND m.user_id = auth.uid()
    )
  );

-- Replies: Members can create replies in discussions they can view
CREATE POLICY "Members can create replies"
  ON group_discussion_replies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_discussions gd
      JOIN group_members gm ON gm.group_id = gd.group_id
      JOIN members m ON m.id = gm.member_id
      WHERE gd.id = group_discussion_replies.discussion_id
      AND m.user_id = auth.uid()
      AND m.id = group_discussion_replies.member_id
      AND gd.is_locked = false
    )
  );

-- Replies: Authors can update their own replies
CREATE POLICY "Authors can update their replies"
  ON group_discussion_replies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = group_discussion_replies.member_id
      AND m.user_id = auth.uid()
    )
  );

-- Replies: Authors and group admins can delete replies
CREATE POLICY "Authors and admins can delete replies"
  ON group_discussion_replies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = group_discussion_replies.member_id
      AND m.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM group_discussions gd
      JOIN group_members gm ON gm.group_id = gd.group_id
      JOIN members m ON m.id = gm.member_id
      WHERE gd.id = group_discussion_replies.discussion_id
      AND m.user_id = auth.uid()
      AND gm.role IN ('admin', 'leader')
    )
  );

-- Grant permissions
GRANT ALL ON group_discussions TO authenticated;
GRANT ALL ON group_discussion_replies TO authenticated;
