-- Migration: Blog/News System
-- For ministry updates, announcements, and articles

-- ======================
-- BLOG POSTS
-- ======================

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,

  -- Categorization
  category VARCHAR(100) DEFAULT 'news', -- 'news', 'announcement', 'devotional', 'testimony', 'ministry-update', 'event-recap'
  tags TEXT[] DEFAULT '{}',

  -- Author
  author_id UUID,
  author_name VARCHAR(255), -- For display (can be overridden)
  author_image_url TEXT,

  -- Publishing
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  is_featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,

  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,

  -- Engagement
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_enabled BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(is_featured, published_at DESC);

-- ======================
-- BLOG CATEGORIES
-- ======================

CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(50) DEFAULT '#1e3a5f', -- For UI styling
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- BLOG COMMENTS
-- ======================

CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  member_id UUID,

  -- For non-members
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),

  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  is_spam BOOLEAN DEFAULT FALSE,

  -- For replies
  parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(post_id, is_approved, created_at);

-- ======================
-- ENABLE RLS
-- ======================

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Public can view published posts
CREATE POLICY "Anyone can view published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Public can view categories
CREATE POLICY "Anyone can view categories" ON blog_categories
  FOR SELECT USING (is_active = true);

-- Public can view approved comments
CREATE POLICY "Anyone can view approved comments" ON blog_comments
  FOR SELECT USING (is_approved = true);

-- Anyone can submit comments
CREATE POLICY "Anyone can submit comments" ON blog_comments
  FOR INSERT WITH CHECK (true);

-- ======================
-- SEED DATA
-- ======================

-- Default categories
INSERT INTO blog_categories (name, slug, description, color, display_order) VALUES
('News', 'news', 'Ministry news and updates', '#1e3a5f', 1),
('Announcements', 'announcements', 'Important announcements', '#d4af37', 2),
('Devotionals', 'devotionals', 'Daily devotional content', '#6b46c1', 3),
('Ministry Updates', 'ministry-updates', 'Updates from our various ministries', '#059669', 4),
('Event Recaps', 'event-recaps', 'Highlights from past events', '#dc2626', 5),
('Testimonies', 'testimonies', 'Stories of transformation', '#ea580c', 6)
ON CONFLICT (slug) DO NOTHING;

-- Sample blog posts
INSERT INTO blog_posts (slug, title, excerpt, content, category, status, is_featured, published_at, author_name) VALUES
(
  'welcome-to-tpc-ministries',
  'Welcome to TPC Ministries',
  'We are excited to launch our new website and share what God is doing through this ministry.',
  E'We are thrilled to welcome you to the new TPC Ministries website!\n\nThis platform represents a significant step forward in our mission to reach and disciple believers around the world. Here you''ll find:\n\n- **Daily Devotionals** - Fresh content to start your day with God\n- **Teachings** - In-depth biblical teaching from Prophet Lorenzo\n- **Prophetic Words** - Personal and corporate prophetic ministry\n- **Assessments** - Tools to discover your spiritual gifts and calling\n- **Community** - Connect with believers around the world\n\nWe believe that every person has a unique calling and purpose in God''s kingdom. Our goal is to help you discover that calling and walk in it fully.\n\n## What''s Next?\n\nWe encourage you to:\n1. Create a free account to access all features\n2. Take the Spiritual Gifts Assessment\n3. Join our community groups\n4. Subscribe to daily devotionals\n\nThank you for being part of this journey. We can''t wait to see what God does in and through you!\n\n*- Prophet Lorenzo Daughtry-Chambers*',
  'announcements',
  'published',
  true,
  NOW() - INTERVAL '7 days',
  'Prophet Lorenzo Daughtry-Chambers'
),
(
  'upcoming-missions-trip-kenya-2025',
  'Upcoming Missions Trip: Kenya 2025',
  'Join us for a life-changing missions experience in Kenya. Applications now open.',
  E'We are excited to announce our upcoming missions trip to Kenya in 2025!\n\n## Trip Details\n\n- **Dates:** March 15-25, 2025\n- **Location:** Nairobi and surrounding communities\n- **Cost:** $2,500 (includes flights, accommodation, meals)\n- **Application Deadline:** January 15, 2025\n\n## What We''ll Be Doing\n\nDuring this 10-day trip, our team will:\n\n1. **Ministry Outreach** - Preaching, teaching, and prayer ministry in local churches\n2. **Medical Missions** - Partnering with local clinics to provide healthcare\n3. **Community Development** - Working on sustainable projects\n4. **Children''s Ministry** - VBS-style programs for local children\n\n## Who Should Apply?\n\nWe''re looking for team members who:\n- Have a heart for missions and serving others\n- Are physically able to handle travel and activity\n- Can commit to pre-trip training sessions\n- Are willing to fundraise their trip costs\n\n## How to Apply\n\nVisit our Missions page to submit your application. Space is limited to 15 team members.\n\nQuestions? Contact us at missions@tpcministries.org',
  'news',
  'published',
  false,
  NOW() - INTERVAL '3 days',
  'Missions Team'
),
(
  'the-power-of-daily-prayer',
  'The Power of Daily Prayer',
  'Discover how establishing a consistent prayer life can transform your walk with God.',
  E'Prayer is the foundation of our relationship with God. Yet for many believers, maintaining a consistent prayer life feels like a constant struggle.\n\n## Why Daily Prayer Matters\n\nJesus modeled the importance of prayer throughout His ministry. Despite His busy schedule of teaching, healing, and discipling, He regularly withdrew to pray (Luke 5:16).\n\nDaily prayer:\n- **Aligns our hearts** with God''s will\n- **Builds intimacy** with our Heavenly Father\n- **Strengthens us** for spiritual battles\n- **Opens doors** for God to work in our lives\n\n## Practical Tips for Daily Prayer\n\n### 1. Set a Specific Time\nChoose a time when you''re most alert and least likely to be interrupted. For many, early morning works best.\n\n### 2. Create a Prayer Space\nDesignate a specific place for prayer. This helps your mind transition into a prayerful state.\n\n### 3. Use a Prayer Framework\nThe ACTS model can help structure your prayer time:\n- **A**doration - Praise God for who He is\n- **C**onfession - Acknowledge your sins\n- **T**hanksgiving - Thank God for His blessings\n- **S**upplication - Present your requests\n\n### 4. Journal Your Prayers\nWriting your prayers helps you stay focused and allows you to look back and see how God has answered.\n\n## Start Today\n\nDon''t wait for the perfect moment. Start with just 5 minutes today. As you experience God''s presence, you''ll naturally want to spend more time with Him.\n\n*"Pray without ceasing." - 1 Thessalonians 5:17*',
  'devotionals',
  'published',
  false,
  NOW() - INTERVAL '1 day',
  'Prophet Lorenzo Daughtry-Chambers'
)
ON CONFLICT (slug) DO NOTHING;
