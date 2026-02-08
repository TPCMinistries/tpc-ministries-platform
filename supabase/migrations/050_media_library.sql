-- Media Library table for centralized media management
CREATE TABLE IF NOT EXISTS media_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  bucket VARCHAR(100) DEFAULT 'tpc-media',
  media_type VARCHAR(50) NOT NULL,  -- image, video, audio, document
  mime_type VARCHAR(100),
  file_size_bytes BIGINT,
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER,
  alt_text VARCHAR(255),
  caption TEXT,
  tags TEXT[] DEFAULT '{}',
  folder VARCHAR(100),
  usage_count INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_media_library_media_type ON media_library(media_type);
CREATE INDEX IF NOT EXISTS idx_media_library_folder ON media_library(folder);
CREATE INDEX IF NOT EXISTS idx_media_library_created_at ON media_library(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_library_search ON media_library USING gin(
  to_tsvector('english', COALESCE(file_name, '') || ' ' || COALESCE(original_name, '') || ' ' || COALESCE(alt_text, '') || ' ' || COALESCE(caption, ''))
);

-- RLS policies
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage media" ON media_library
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = auth.uid()
      AND members.is_admin = true
    )
  );

-- Public can read
CREATE POLICY "Public can view media" ON media_library
  FOR SELECT
  USING (true);
