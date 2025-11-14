-- Add image_url column to prophecies table
ALTER TABLE prophecies
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_url column to events table if it exists
ALTER TABLE events
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add thumbnail_url column to resources table if it exists
ALTER TABLE resources
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add comments
COMMENT ON COLUMN prophecies.image_url IS 'URL to header/banner image for the prophecy post';
COMMENT ON COLUMN events.image_url IS 'URL to event banner/thumbnail image';
COMMENT ON COLUMN resources.thumbnail_url IS 'URL to resource thumbnail image';
