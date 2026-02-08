-- Add content_format to track which content uses rich text HTML
-- Existing content stays as 'text' format. New rich content sets 'html'.

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS content_format VARCHAR(20) DEFAULT 'text';
ALTER TABLE teachings ADD COLUMN IF NOT EXISTS content_html TEXT;
ALTER TABLE teachings ADD COLUMN IF NOT EXISTS content_format VARCHAR(20) DEFAULT 'text';
ALTER TABLE prophecies ADD COLUMN IF NOT EXISTS content_format VARCHAR(20) DEFAULT 'text';
ALTER TABLE resources ADD COLUMN IF NOT EXISTS description_html TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS description_html TEXT;
