-- Add scheduling fields to teachings table
ALTER TABLE teachings
ADD COLUMN IF NOT EXISTS scheduled_publish_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS series_id UUID,
ADD COLUMN IF NOT EXISTS series_order INTEGER,
ADD COLUMN IF NOT EXISTS drip_days INTEGER; -- Days after member join date to unlock

-- Create teaching_series table
CREATE TABLE IF NOT EXISTS teaching_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create member_progress table to track teaching completion
CREATE TABLE IF NOT EXISTS member_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  teaching_id UUID NOT NULL REFERENCES teachings(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(member_id, teaching_id)
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL, -- 'teaching', 'devotional', 'prophecy'
  content_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, content_type, content_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_teachings_scheduled ON teachings(scheduled_publish_date);
CREATE INDEX IF NOT EXISTS idx_teachings_published ON teachings(is_published);
CREATE INDEX IF NOT EXISTS idx_teachings_series ON teachings(series_id);
CREATE INDEX IF NOT EXISTS idx_member_progress_member ON member_progress(member_id);
CREATE INDEX IF NOT EXISTS idx_member_progress_teaching ON member_progress(teaching_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_member ON bookmarks(member_id);

-- Add foreign key for series
ALTER TABLE teachings
ADD CONSTRAINT fk_teachings_series
FOREIGN KEY (series_id) REFERENCES teaching_series(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE teaching_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teaching_series
-- Everyone can view active series
CREATE POLICY "Everyone can view active series"
  ON teaching_series FOR SELECT
  USING (is_active = true);

-- Admins can manage series
CREATE POLICY "Admins can manage series"
  ON teaching_series FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.auth_user_id = auth.uid()
      AND members.role = 'admin'
    )
  );

-- RLS Policies for member_progress
-- Members can view and manage their own progress
CREATE POLICY "Members can view own progress"
  ON member_progress FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create own progress"
  ON member_progress FOR INSERT
  WITH CHECK (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update own progress"
  ON member_progress FOR UPDATE
  USING (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );

-- Admins can view all progress
CREATE POLICY "Admins can view all progress"
  ON member_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.auth_user_id = auth.uid()
      AND members.role = 'admin'
    )
  );

-- RLS Policies for bookmarks
-- Members can manage their own bookmarks
CREATE POLICY "Members can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Members can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );

-- Update teachings RLS to only show published teachings to non-admins
DROP POLICY IF EXISTS "Anyone can view teachings" ON teachings;

CREATE POLICY "Members can view published teachings"
  ON teachings FOR SELECT
  USING (
    is_published = true
    OR EXISTS (
      SELECT 1 FROM members
      WHERE members.auth_user_id = auth.uid()
      AND members.role = 'admin'
    )
  );

-- Function to auto-publish scheduled content
CREATE OR REPLACE FUNCTION publish_scheduled_content()
RETURNS void AS $$
BEGIN
  UPDATE teachings
  SET is_published = true,
      published_at = NOW()
  WHERE scheduled_publish_date <= NOW()
    AND is_published = false
    AND scheduled_publish_date IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON COLUMN teachings.scheduled_publish_date IS 'Date/time to automatically publish this teaching';
COMMENT ON COLUMN teachings.drip_days IS 'Number of days after member joins to unlock this content';
COMMENT ON TABLE teaching_series IS 'Collections of related teachings';
COMMENT ON TABLE member_progress IS 'Tracks member progress through teachings';
COMMENT ON TABLE bookmarks IS 'Member bookmarks for content they want to return to';
