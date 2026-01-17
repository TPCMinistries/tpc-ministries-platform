-- Member Watchlist for saving content to watch later
-- Migration: 031_member_watchlist.sql

CREATE TABLE IF NOT EXISTS member_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  content_id uuid NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('teaching', 'resource', 'sermon')),
  added_at timestamptz DEFAULT now(),
  UNIQUE(member_id, content_id, content_type)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_member_watchlist_member_id ON member_watchlist(member_id);
CREATE INDEX IF NOT EXISTS idx_member_watchlist_content ON member_watchlist(content_type, content_id);

-- Enable RLS
ALTER TABLE member_watchlist ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Members can view their own watchlist"
  ON member_watchlist FOR SELECT
  USING (member_id IN (
    SELECT id FROM members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Members can add to their own watchlist"
  ON member_watchlist FOR INSERT
  WITH CHECK (member_id IN (
    SELECT id FROM members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Members can remove from their own watchlist"
  ON member_watchlist FOR DELETE
  USING (member_id IN (
    SELECT id FROM members WHERE user_id = auth.uid()
  ));

-- Add view_count and is_featured columns to teachings if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teachings' AND column_name = 'view_count') THEN
    ALTER TABLE teachings ADD COLUMN view_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teachings' AND column_name = 'is_featured') THEN
    ALTER TABLE teachings ADD COLUMN is_featured boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teachings' AND column_name = 'series_name') THEN
    ALTER TABLE teachings ADD COLUMN series_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teachings' AND column_name = 'tags') THEN
    ALTER TABLE teachings ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
END $$;

-- Add view_count and is_featured columns to resources if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'is_featured') THEN
    ALTER TABLE resources ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
END $$;

-- Add view_count and is_featured columns to sermons if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'view_count') THEN
    ALTER TABLE sermons ADD COLUMN view_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'is_featured') THEN
    ALTER TABLE sermons ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
END $$;

COMMENT ON TABLE member_watchlist IS 'Stores content items saved by members to watch later';
