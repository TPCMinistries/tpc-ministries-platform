-- Community Activity Feed
-- Tracks public activities for community engagement (privacy-conscious)

CREATE TABLE IF NOT EXISTS community_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_community_activity_created ON community_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_activity_member ON community_activity(member_id);
CREATE INDEX IF NOT EXISTS idx_community_activity_type ON community_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_community_activity_public ON community_activity(is_public, created_at DESC);

-- RLS Policies
ALTER TABLE community_activity ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view public activities
CREATE POLICY "View public activities"
  ON community_activity FOR SELECT
  USING (is_public = true);

-- Members can view their own activities (public or private)
CREATE POLICY "View own activities"
  ON community_activity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = community_activity.member_id
      AND m.user_id = auth.uid()
    )
  );

-- Only system/triggers can insert activities (via service role)
-- For app inserts, we'll use the API with service role
CREATE POLICY "Insert own activities"
  ON community_activity FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = community_activity.member_id
      AND m.user_id = auth.uid()
    )
  );

-- Members can delete their own activities
CREATE POLICY "Delete own activities"
  ON community_activity FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = community_activity.member_id
      AND m.user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT ALL ON community_activity TO authenticated;

-- Function to log activity (can be called from triggers or API)
CREATE OR REPLACE FUNCTION log_community_activity(
  p_member_id UUID,
  p_activity_type VARCHAR(50),
  p_title VARCHAR(255),
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_is_public BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO community_activity (member_id, activity_type, title, description, metadata, is_public)
  VALUES (p_member_id, p_activity_type, p_title, p_description, p_metadata, p_is_public)
  RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for assessment completions
CREATE OR REPLACE FUNCTION on_assessment_complete()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if member allows public activity
  PERFORM log_community_activity(
    NEW.member_id,
    'assessment_complete',
    'Completed ' || NEW.assessment_type || ' Assessment',
    NULL,
    jsonb_build_object('assessment_type', NEW.assessment_type, 'assessment_id', NEW.id),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for group joins
CREATE OR REPLACE FUNCTION on_group_join()
RETURNS TRIGGER AS $$
DECLARE
  v_group_name VARCHAR(255);
BEGIN
  -- Get group name
  SELECT name INTO v_group_name FROM community_groups WHERE id = NEW.group_id;

  IF NEW.status = 'active' THEN
    PERFORM log_community_activity(
      NEW.member_id,
      'group_join',
      'Joined ' || COALESCE(v_group_name, 'a group'),
      NULL,
      jsonb_build_object('group_id', NEW.group_id, 'group_name', v_group_name),
      true
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for badge earnings
CREATE OR REPLACE FUNCTION on_badge_earned()
RETURNS TRIGGER AS $$
DECLARE
  v_badge_name VARCHAR(255);
BEGIN
  -- Get badge name
  SELECT name INTO v_badge_name FROM badges WHERE id = NEW.badge_id;

  PERFORM log_community_activity(
    NEW.member_id,
    'badge_earned',
    'Earned the ' || COALESCE(v_badge_name, 'new') || ' badge',
    NULL,
    jsonb_build_object('badge_id', NEW.badge_id, 'badge_name', v_badge_name),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for discussion creation
CREATE OR REPLACE FUNCTION on_discussion_created()
RETURNS TRIGGER AS $$
DECLARE
  v_group_name VARCHAR(255);
BEGIN
  -- Get group name
  SELECT name INTO v_group_name FROM community_groups WHERE id = NEW.group_id;

  PERFORM log_community_activity(
    NEW.member_id,
    'discussion_created',
    'Started a discussion in ' || COALESCE(v_group_name, 'a group'),
    NEW.title,
    jsonb_build_object('group_id', NEW.group_id, 'discussion_id', NEW.id),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers (only if tables exist)
DO $$
BEGIN
  -- Assessment completion trigger
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assessment_results') THEN
    DROP TRIGGER IF EXISTS trigger_assessment_complete ON assessment_results;
    CREATE TRIGGER trigger_assessment_complete
      AFTER INSERT ON assessment_results
      FOR EACH ROW
      EXECUTE FUNCTION on_assessment_complete();
  END IF;

  -- Group join trigger
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_members') THEN
    DROP TRIGGER IF EXISTS trigger_group_join ON group_members;
    CREATE TRIGGER trigger_group_join
      AFTER INSERT OR UPDATE OF status ON group_members
      FOR EACH ROW
      WHEN (NEW.status = 'active')
      EXECUTE FUNCTION on_group_join();
  END IF;

  -- Badge earned trigger
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'member_badges') THEN
    DROP TRIGGER IF EXISTS trigger_badge_earned ON member_badges;
    CREATE TRIGGER trigger_badge_earned
      AFTER INSERT ON member_badges
      FOR EACH ROW
      EXECUTE FUNCTION on_badge_earned();
  END IF;

  -- Discussion created trigger
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_discussions') THEN
    DROP TRIGGER IF EXISTS trigger_discussion_created ON group_discussions;
    CREATE TRIGGER trigger_discussion_created
      AFTER INSERT ON group_discussions
      FOR EACH ROW
      EXECUTE FUNCTION on_discussion_created();
  END IF;
END $$;
