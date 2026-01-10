-- Migration: Public Site Features
-- Contact submissions, service times, testimonies enhancements

-- ======================
-- CONTACT SUBMISSIONS
-- ======================

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general', -- 'general', 'prayer', 'giving', 'partnership', 'missions', 'events'
  status VARCHAR(50) DEFAULT 'new', -- 'new', 'read', 'responded', 'archived'
  responded_by UUID,
  responded_at TIMESTAMPTZ,
  response_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_category ON contact_submissions(category);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created ON contact_submissions(created_at DESC);

-- ======================
-- SERVICE TIMES
-- ======================

CREATE TABLE IF NOT EXISTS service_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  day_of_week INTEGER, -- 0=Sunday, 1=Monday, etc. NULL for special events
  start_time TIME NOT NULL,
  end_time TIME,
  location VARCHAR(255),
  location_type VARCHAR(50) DEFAULT 'in_person', -- 'in_person', 'online', 'hybrid'
  stream_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_times_active ON service_times(is_active, display_order);

-- ======================
-- CHURCH LOCATIONS
-- ======================

CREATE TABLE IF NOT EXISTS church_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'USA',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(50),
  email VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- FAQ
-- ======================

CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'general', -- 'general', 'visiting', 'giving', 'membership', 'beliefs'
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category, display_order);

-- ======================
-- ENABLE RLS
-- ======================

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Public can insert contact submissions
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- Public can view service times
CREATE POLICY "Anyone can view service times" ON service_times
  FOR SELECT USING (is_active = true);

-- Public can view locations
CREATE POLICY "Anyone can view locations" ON church_locations
  FOR SELECT USING (is_active = true);

-- Public can view FAQs
CREATE POLICY "Anyone can view FAQs" ON faqs
  FOR SELECT USING (is_published = true);

-- ======================
-- SEED DATA
-- ======================

-- Default service times
INSERT INTO service_times (name, description, day_of_week, start_time, end_time, location, location_type, display_order) VALUES
('Sunday Worship', 'Main worship service with praise, worship, and the Word', 0, '10:00', '12:00', 'Main Sanctuary', 'hybrid', 1),
('Wednesday Bible Study', 'Mid-week teaching and fellowship', 3, '19:00', '20:30', 'Fellowship Hall', 'hybrid', 2),
('Friday Prayer Night', 'Corporate prayer and intercession', 5, '19:00', '21:00', 'Prayer Room', 'in_person', 3)
ON CONFLICT DO NOTHING;

-- Default FAQs
INSERT INTO faqs (question, answer, category, display_order) VALUES
('What should I expect on my first visit?', 'We''re so glad you''re considering visiting! When you arrive, our greeters will welcome you and help you find your way. Our services typically last about 90 minutes and include contemporary worship music and a relevant, Bible-based message. Dress is casual - come as you are!', 'visiting', 1),
('Do you have programs for children?', 'Yes! We have age-appropriate programs for children from nursery through 5th grade during our Sunday services. Our trained volunteers create a safe, fun environment where kids can learn about Jesus at their level.', 'visiting', 2),
('How can I get involved?', 'There are many ways to get connected! You can join a small group, volunteer on one of our ministry teams, or attend our membership class. Visit our Groups page or speak with one of our pastors after service to learn more.', 'general', 3),
('What do you believe?', 'We believe the Bible is the inspired Word of God, that Jesus Christ is the Son of God who died for our sins and rose again, and that salvation comes through faith in Him. We believe in the power of the Holy Spirit to transform lives today. Visit our About page for our full statement of faith.', 'beliefs', 4),
('How can I give?', 'You can give online through our secure giving platform, in person during services, or by mail. We accept one-time gifts or you can set up recurring giving. All gifts are tax-deductible.', 'giving', 5),
('How do I become a member?', 'We''d love to have you as part of our church family! Start by attending our membership class, which covers our beliefs, vision, and how you can get connected. Classes are offered monthly - check our events page for the next date.', 'membership', 6)
ON CONFLICT DO NOTHING;
