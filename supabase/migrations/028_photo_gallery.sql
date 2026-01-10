-- ============================================
-- PHOTO GALLERY SYSTEM
-- Albums, Photos, and Event Galleries
-- ============================================

-- ============================================
-- 1. PHOTO ALBUMS
-- ============================================
CREATE TABLE IF NOT EXISTS photo_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  cover_photo_id UUID, -- Will be set after photos table created
  -- Event association
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  -- Organization
  category VARCHAR(100), -- 'events', 'worship', 'outreach', 'missions', 'baptism', 'community', 'other'
  date DATE,
  location VARCHAR(255),
  -- Visibility
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  -- Stats
  photo_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  -- Metadata
  photographer VARCHAR(255),
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES members(id) ON DELETE SET NULL
);

CREATE INDEX idx_albums_slug ON photo_albums(slug);
CREATE INDEX idx_albums_category ON photo_albums(category);
CREATE INDEX idx_albums_date ON photo_albums(date DESC);
CREATE INDEX idx_albums_featured ON photo_albums(is_featured, is_public);
CREATE INDEX idx_albums_event ON photo_albums(event_id);

-- ============================================
-- 2. PHOTOS
-- ============================================
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES photo_albums(id) ON DELETE CASCADE,
  -- Image URLs
  original_url TEXT NOT NULL,
  thumbnail_url TEXT,
  medium_url TEXT,
  large_url TEXT,
  -- Metadata
  title VARCHAR(255),
  description TEXT,
  alt_text VARCHAR(255),
  -- Image dimensions
  width INTEGER,
  height INTEGER,
  file_size INTEGER, -- in bytes
  mime_type VARCHAR(50),
  -- Organization
  sort_order INTEGER DEFAULT 0,
  is_cover BOOLEAN DEFAULT false,
  -- EXIF data
  taken_at TIMESTAMPTZ,
  camera_make VARCHAR(100),
  camera_model VARCHAR(100),
  -- Stats
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES members(id) ON DELETE SET NULL
);

CREATE INDEX idx_photos_album ON photos(album_id, sort_order);
CREATE INDEX idx_photos_cover ON photos(album_id, is_cover);

-- Add foreign key for cover photo after photos table exists
ALTER TABLE photo_albums
  ADD CONSTRAINT fk_cover_photo
  FOREIGN KEY (cover_photo_id)
  REFERENCES photos(id)
  ON DELETE SET NULL;

-- ============================================
-- 3. PHOTO TAGS
-- ============================================
CREATE TABLE IF NOT EXISTS photo_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  photo_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photo_tag_assignments (
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES photo_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, tag_id)
);

CREATE INDEX idx_photo_tags_name ON photo_tags(name);

-- ============================================
-- 4. PHOTO PEOPLE TAGS (tag members in photos)
-- ============================================
CREATE TABLE IF NOT EXISTS photo_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  -- Position in photo (for face tagging)
  x_position DECIMAL(5,2), -- percentage from left
  y_position DECIMAL(5,2), -- percentage from top
  -- For non-member names
  name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES members(id) ON DELETE SET NULL
);

CREATE INDEX idx_photo_people_photo ON photo_people(photo_id);
CREATE INDEX idx_photo_people_member ON photo_people(member_id);

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_people ENABLE ROW LEVEL SECURITY;

-- Albums: Public albums visible to all, private only to members
CREATE POLICY "Anyone can view public albums" ON photo_albums
  FOR SELECT USING (is_public = true);

CREATE POLICY "Members can view all albums" ON photo_albums
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM members WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Admins can manage albums" ON photo_albums
  FOR ALL USING (
    EXISTS (SELECT 1 FROM members WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

-- Photos: Follow album visibility
CREATE POLICY "Anyone can view photos in public albums" ON photos
  FOR SELECT USING (
    album_id IN (SELECT id FROM photo_albums WHERE is_public = true)
  );

CREATE POLICY "Members can view all photos" ON photos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM members WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Admins can manage photos" ON photos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM members WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

-- Tags: Anyone can view
CREATE POLICY "Anyone can view tags" ON photo_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tags" ON photo_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM members WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

-- Tag assignments: Follow photo visibility
CREATE POLICY "Anyone can view tag assignments" ON photo_tag_assignments
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tag assignments" ON photo_tag_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM members WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

-- People tags: Members can view, admins can manage
CREATE POLICY "Members can view people tags" ON photo_people
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM members WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Admins can manage people tags" ON photo_people
  FOR ALL USING (
    EXISTS (SELECT 1 FROM members WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 6. FUNCTIONS
-- ============================================

-- Function to update album photo count
CREATE OR REPLACE FUNCTION update_album_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE photo_albums SET photo_count = photo_count + 1 WHERE id = NEW.album_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE photo_albums SET photo_count = photo_count - 1 WHERE id = OLD.album_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_album_photo_count
AFTER INSERT OR DELETE ON photos
FOR EACH ROW EXECUTE FUNCTION update_album_photo_count();

-- Function to update tag photo count
CREATE OR REPLACE FUNCTION update_tag_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE photo_tags SET photo_count = photo_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE photo_tags SET photo_count = photo_count - 1 WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_photo_count
AFTER INSERT OR DELETE ON photo_tag_assignments
FOR EACH ROW EXECUTE FUNCTION update_tag_photo_count();

-- ============================================
-- 7. ADD COMMENTS
-- ============================================
COMMENT ON TABLE photo_albums IS 'Photo album collections for events and general church photos';
COMMENT ON TABLE photos IS 'Individual photos within albums';
COMMENT ON TABLE photo_tags IS 'Tags for categorizing photos';
COMMENT ON TABLE photo_people IS 'People tagged in photos';
