-- Photo Gallery Tables
-- Create photo_albums table
CREATE TABLE IF NOT EXISTS photo_albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT,
  date DATE,
  location TEXT,
  photographer TEXT,
  photo_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  cover_photo_id UUID,
  created_by UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES photo_albums(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  thumbnail_url TEXT,
  medium_url TEXT,
  large_url TEXT,
  title TEXT,
  description TEXT,
  alt_text TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  mime_type TEXT,
  exif_data JSONB,
  sort_order INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for cover photo
ALTER TABLE photo_albums
ADD CONSTRAINT photo_albums_cover_photo_id_fkey
FOREIGN KEY (cover_photo_id) REFERENCES photos(id) ON DELETE SET NULL;

-- Create photo_tags table
CREATE TABLE IF NOT EXISTS photo_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  photo_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create photo_tag_links table (many-to-many)
CREATE TABLE IF NOT EXISTS photo_tag_links (
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES photo_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, tag_id)
);

-- Create photo_people table (for tagging people in photos)
CREATE TABLE IF NOT EXISTS photo_people (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  name TEXT,
  position_x DECIMAL(5,2),
  position_y DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_photo_albums_slug ON photo_albums(slug);
CREATE INDEX IF NOT EXISTS idx_photo_albums_is_public ON photo_albums(is_public);
CREATE INDEX IF NOT EXISTS idx_photo_albums_is_featured ON photo_albums(is_featured);
CREATE INDEX IF NOT EXISTS idx_photo_albums_category ON photo_albums(category);
CREATE INDEX IF NOT EXISTS idx_photo_albums_date ON photo_albums(date DESC);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);
CREATE INDEX IF NOT EXISTS idx_photos_sort_order ON photos(album_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_photo_people_photo_id ON photo_people(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_people_member_id ON photo_people(member_id);

-- Function to update photo count on album
CREATE OR REPLACE FUNCTION update_album_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE photo_albums SET photo_count = photo_count + 1, updated_at = NOW() WHERE id = NEW.album_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE photo_albums SET photo_count = photo_count - 1, updated_at = NOW() WHERE id = OLD.album_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for photo count
DROP TRIGGER IF EXISTS trigger_update_album_photo_count ON photos;
CREATE TRIGGER trigger_update_album_photo_count
AFTER INSERT OR DELETE ON photos
FOR EACH ROW
EXECUTE FUNCTION update_album_photo_count();

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

-- Trigger for tag count
DROP TRIGGER IF EXISTS trigger_update_tag_photo_count ON photo_tag_links;
CREATE TRIGGER trigger_update_tag_photo_count
AFTER INSERT OR DELETE ON photo_tag_links
FOR EACH ROW
EXECUTE FUNCTION update_tag_photo_count();

-- Enable RLS
ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_tag_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_people ENABLE ROW LEVEL SECURITY;

-- RLS Policies for photo_albums
CREATE POLICY "Public albums are viewable by everyone" ON photo_albums
  FOR SELECT USING (is_public = true);

CREATE POLICY "Members can view all albums" ON photo_albums
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage albums" ON photo_albums
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE user_id = auth.uid()
      AND (is_admin = true OR role IN ('admin', 'staff'))
    )
  );

-- RLS Policies for photos
CREATE POLICY "Photos in public albums are viewable by everyone" ON photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM photo_albums
      WHERE photo_albums.id = photos.album_id
      AND photo_albums.is_public = true
    )
  );

CREATE POLICY "Members can view all photos" ON photos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage photos" ON photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE user_id = auth.uid()
      AND (is_admin = true OR role IN ('admin', 'staff'))
    )
  );

-- RLS Policies for photo_tags
CREATE POLICY "Anyone can view tags" ON photo_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tags" ON photo_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE user_id = auth.uid()
      AND (is_admin = true OR role IN ('admin', 'staff'))
    )
  );

-- RLS Policies for photo_tag_links
CREATE POLICY "Anyone can view tag links" ON photo_tag_links
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tag links" ON photo_tag_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE user_id = auth.uid()
      AND (is_admin = true OR role IN ('admin', 'staff'))
    )
  );

-- RLS Policies for photo_people
CREATE POLICY "Anyone can view photo people" ON photo_people
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage photo people" ON photo_people
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE user_id = auth.uid()
      AND (is_admin = true OR role IN ('admin', 'staff'))
    )
  );
