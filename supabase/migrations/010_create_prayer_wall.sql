-- Update prayer_requests table to support public prayer wall
ALTER TABLE prayer_requests
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS prayer_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_answered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS answered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS testimony TEXT;

-- Create prayer_interactions table to track who prayed for what
CREATE TABLE IF NOT EXISTS prayer_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_request_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  prayed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prayer_request_id, member_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prayer_requests_public ON prayer_requests(is_public);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_answered ON prayer_requests(is_answered);
CREATE INDEX IF NOT EXISTS idx_prayer_interactions_request ON prayer_interactions(prayer_request_id);
CREATE INDEX IF NOT EXISTS idx_prayer_interactions_member ON prayer_interactions(member_id);

-- Enable RLS on prayer_interactions
ALTER TABLE prayer_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prayer_interactions
-- Members can view interactions
CREATE POLICY "Members can view prayer interactions"
  ON prayer_interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members WHERE members.auth_user_id = auth.uid()
    )
  );

-- Members can create their own interactions
CREATE POLICY "Members can create prayer interactions"
  ON prayer_interactions FOR INSERT
  WITH CHECK (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );

-- Members can delete their own interactions
CREATE POLICY "Members can delete own interactions"
  ON prayer_interactions FOR DELETE
  USING (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );

-- Update RLS policies for prayer_requests to include public requests
DROP POLICY IF EXISTS "Members can view own prayers" ON prayer_requests;

-- New policy: Members can view their own prayers AND public prayers
CREATE POLICY "Members can view own and public prayers"
  ON prayer_requests FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
    OR is_public = true
  );

-- Add trigger to update prayer_count when someone prays
CREATE OR REPLACE FUNCTION update_prayer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE prayer_requests
    SET prayer_count = prayer_count + 1
    WHERE id = NEW.prayer_request_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE prayer_requests
    SET prayer_count = GREATEST(prayer_count - 1, 0)
    WHERE id = OLD.prayer_request_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prayer_count_trigger
AFTER INSERT OR DELETE ON prayer_interactions
FOR EACH ROW
EXECUTE FUNCTION update_prayer_count();

-- Add comments
COMMENT ON COLUMN prayer_requests.is_public IS 'Whether this prayer request is visible on the public prayer wall';
COMMENT ON COLUMN prayer_requests.prayer_count IS 'Number of members who have prayed for this request';
COMMENT ON COLUMN prayer_requests.is_answered IS 'Whether this prayer has been answered';
COMMENT ON TABLE prayer_interactions IS 'Tracks which members have prayed for which requests';
