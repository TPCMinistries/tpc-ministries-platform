-- PLANT Learning Management System
-- Purpose. Learn. Activate. Nurture. Thrive.
-- Multi-tenant design supporting TPC content and general ministry content

-- ============================================
-- INSTRUCTORS
-- ============================================
CREATE TABLE IF NOT EXISTS plant_instructors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  -- For external instructors not in members table
  external_name VARCHAR(255),
  external_email VARCHAR(255),
  external_bio TEXT,
  external_avatar_url TEXT,
  -- Common fields
  title VARCHAR(100), -- e.g., "Pastor", "Minister", "Teacher"
  specialty VARCHAR(255), -- e.g., "Prophetic Ministry", "Biblical Studies"
  credentials TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEARNING PATHS (Tracks/Programs)
-- ============================================
CREATE TABLE IF NOT EXISTS plant_learning_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  long_description TEXT,
  thumbnail_url TEXT,
  banner_url TEXT,
  -- Categorization
  category VARCHAR(100), -- 'discipleship', 'leadership', 'prophetic', 'ministry', 'bible-study'
  difficulty_level VARCHAR(50) DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  -- Multi-tenant support
  ministry_id VARCHAR(100) DEFAULT 'tpc', -- 'tpc' for TPC-specific, 'general' for all, or specific ministry ID
  is_public BOOLEAN DEFAULT true, -- visible to non-enrolled users
  -- Access control
  required_tier VARCHAR(50) DEFAULT 'free', -- 'free', 'partner', 'covenant'
  -- Metadata
  estimated_hours INTEGER,
  total_courses INTEGER DEFAULT 0,
  enrollment_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COURSES
-- ============================================
CREATE TABLE IF NOT EXISTS plant_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  long_description TEXT,
  thumbnail_url TEXT,
  promo_video_url TEXT,
  -- Instructor
  primary_instructor_id UUID REFERENCES plant_instructors(id),
  -- Categorization
  category VARCHAR(100),
  tags TEXT[], -- Array of tags for filtering
  difficulty_level VARCHAR(50) DEFAULT 'beginner',
  -- Multi-tenant
  ministry_id VARCHAR(100) DEFAULT 'tpc',
  is_public BOOLEAN DEFAULT true,
  -- Access control
  required_tier VARCHAR(50) DEFAULT 'free',
  -- Course structure
  total_modules INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  estimated_hours INTEGER,
  -- Engagement
  enrollment_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  -- Certification
  has_certificate BOOLEAN DEFAULT true,
  certificate_template_id UUID,
  -- Prerequisites (course IDs)
  prerequisites UUID[] DEFAULT '{}',
  -- Status
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEARNING PATH <-> COURSE JUNCTION
-- ============================================
CREATE TABLE IF NOT EXISTS plant_path_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learning_path_id UUID REFERENCES plant_learning_paths(id) ON DELETE CASCADE,
  course_id UUID REFERENCES plant_courses(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true, -- Required for path completion
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(learning_path_id, course_id)
);

-- ============================================
-- MODULES (Sections within a Course)
-- ============================================
CREATE TABLE IF NOT EXISTS plant_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES plant_courses(id) ON DELETE CASCADE,
  slug VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sequence_order INTEGER NOT NULL,
  -- Module-level quiz
  has_quiz BOOLEAN DEFAULT false,
  quiz_passing_score INTEGER DEFAULT 70,
  -- Unlock conditions
  unlock_after_module_id UUID REFERENCES plant_modules(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, slug)
);

-- ============================================
-- LESSONS (Content within Modules)
-- ============================================
CREATE TABLE IF NOT EXISTS plant_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES plant_modules(id) ON DELETE CASCADE,
  slug VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sequence_order INTEGER NOT NULL,
  -- Content
  content_type VARCHAR(50) DEFAULT 'video', -- 'video', 'text', 'audio', 'pdf', 'interactive'
  video_url TEXT,
  video_duration INTEGER, -- seconds
  audio_url TEXT,
  audio_duration INTEGER,
  content_html TEXT, -- Rich text content
  pdf_url TEXT,
  -- Attachments/Resources
  resources JSONB DEFAULT '[]', -- [{name, url, type}]
  -- Engagement
  estimated_minutes INTEGER DEFAULT 10,
  -- Scripture references
  scripture_references TEXT[],
  -- Status
  is_preview BOOLEAN DEFAULT false, -- Can be viewed without enrollment
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, slug)
);

-- ============================================
-- QUIZZES
-- ============================================
CREATE TABLE IF NOT EXISTS plant_quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES plant_modules(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  -- Settings
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER, -- NULL = no limit
  max_attempts INTEGER DEFAULT 3, -- NULL = unlimited
  shuffle_questions BOOLEAN DEFAULT true,
  show_correct_answers BOOLEAN DEFAULT true,
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- QUIZ QUESTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS plant_quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES plant_quizzes(id) ON DELETE CASCADE,
  question_type VARCHAR(50) DEFAULT 'multiple_choice', -- 'multiple_choice', 'true_false', 'short_answer'
  question_text TEXT NOT NULL,
  -- For multiple choice
  options JSONB, -- [{id, text, is_correct}]
  -- For true/false
  correct_answer BOOLEAN,
  -- For short answer
  expected_keywords TEXT[],
  -- Explanation shown after answering
  explanation TEXT,
  -- Points
  points INTEGER DEFAULT 1,
  sequence_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENROLLMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS plant_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  course_id UUID REFERENCES plant_courses(id) ON DELETE CASCADE,
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'paused', 'expired'
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  -- Progress
  progress_percent DECIMAL(5,2) DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  last_lesson_id UUID REFERENCES plant_lessons(id),
  -- Time tracking
  total_time_spent INTEGER DEFAULT 0, -- seconds
  -- Completion
  certificate_issued BOOLEAN DEFAULT false,
  certificate_id UUID,
  UNIQUE(member_id, course_id)
);

-- ============================================
-- LEARNING PATH ENROLLMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS plant_path_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  learning_path_id UUID REFERENCES plant_learning_paths(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active',
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress_percent DECIMAL(5,2) DEFAULT 0,
  certificate_issued BOOLEAN DEFAULT false,
  certificate_id UUID,
  UNIQUE(member_id, learning_path_id)
);

-- ============================================
-- LESSON PROGRESS
-- ============================================
CREATE TABLE IF NOT EXISTS plant_lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES plant_lessons(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES plant_enrollments(id) ON DELETE CASCADE,
  -- Progress
  status VARCHAR(50) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  progress_percent DECIMAL(5,2) DEFAULT 0,
  video_position INTEGER DEFAULT 0, -- seconds, for video resume
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  time_spent INTEGER DEFAULT 0, -- seconds
  -- Notes
  personal_notes TEXT,
  UNIQUE(member_id, lesson_id)
);

-- ============================================
-- QUIZ ATTEMPTS
-- ============================================
CREATE TABLE IF NOT EXISTS plant_quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES plant_quizzes(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES plant_enrollments(id) ON DELETE CASCADE,
  -- Results
  score DECIMAL(5,2),
  passed BOOLEAN,
  -- Answers
  answers JSONB, -- [{question_id, answer, is_correct}]
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_taken INTEGER -- seconds
);

-- ============================================
-- CERTIFICATES
-- ============================================
CREATE TABLE IF NOT EXISTS plant_certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  -- Can be for course or learning path
  course_id UUID REFERENCES plant_courses(id) ON DELETE SET NULL,
  learning_path_id UUID REFERENCES plant_learning_paths(id) ON DELETE SET NULL,
  -- Certificate details
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  -- Verification
  verification_url TEXT,
  -- PDF storage
  pdf_url TEXT,
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- ============================================
-- COURSE REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS plant_course_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  course_id UUID REFERENCES plant_courses(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, course_id)
);

-- ============================================
-- DISCUSSION THREADS (per lesson)
-- ============================================
CREATE TABLE IF NOT EXISTS plant_discussions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES plant_lessons(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES plant_discussions(id) ON DELETE CASCADE, -- for replies
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_instructor_reply BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOOKMARKS
-- ============================================
CREATE TABLE IF NOT EXISTS plant_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES plant_lessons(id) ON DELETE CASCADE,
  note TEXT,
  timestamp_seconds INTEGER, -- for video bookmarks
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, lesson_id, timestamp_seconds)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_plant_courses_status ON plant_courses(status);
CREATE INDEX IF NOT EXISTS idx_plant_courses_ministry ON plant_courses(ministry_id);
CREATE INDEX IF NOT EXISTS idx_plant_courses_category ON plant_courses(category);
CREATE INDEX IF NOT EXISTS idx_plant_lessons_module ON plant_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_plant_modules_course ON plant_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_plant_enrollments_member ON plant_enrollments(member_id);
CREATE INDEX IF NOT EXISTS idx_plant_enrollments_course ON plant_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_plant_lesson_progress_member ON plant_lesson_progress(member_id);
CREATE INDEX IF NOT EXISTS idx_plant_path_enrollments_member ON plant_path_enrollments(member_id);
CREATE INDEX IF NOT EXISTS idx_plant_certificates_member ON plant_certificates(member_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE plant_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_path_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_path_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_bookmarks ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Anyone can view published learning paths" ON plant_learning_paths
  FOR SELECT USING (status = 'published' AND is_public = true);

CREATE POLICY "Anyone can view published courses" ON plant_courses
  FOR SELECT USING (status = 'published' AND is_public = true);

CREATE POLICY "Anyone can view modules of published courses" ON plant_modules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM plant_courses WHERE id = course_id AND status = 'published')
  );

CREATE POLICY "Anyone can view lessons of published courses" ON plant_lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM plant_modules m
      JOIN plant_courses c ON c.id = m.course_id
      WHERE m.id = module_id AND c.status = 'published'
    )
  );

CREATE POLICY "Anyone can view active instructors" ON plant_instructors
  FOR SELECT USING (is_active = true);

-- Member-specific policies (using auth.uid())
CREATE POLICY "Members can view their enrollments" ON plant_enrollments
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can enroll in courses" ON plant_enrollments
  FOR INSERT WITH CHECK (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can update their enrollments" ON plant_enrollments
  FOR UPDATE USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can view their path enrollments" ON plant_path_enrollments
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can enroll in paths" ON plant_path_enrollments
  FOR INSERT WITH CHECK (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can view their lesson progress" ON plant_lesson_progress
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can update their lesson progress" ON plant_lesson_progress
  FOR ALL USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can view their quiz attempts" ON plant_quiz_attempts
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can create quiz attempts" ON plant_quiz_attempts
  FOR INSERT WITH CHECK (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can view their certificates" ON plant_certificates
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can view public reviews" ON plant_course_reviews
  FOR SELECT USING (is_public = true);

CREATE POLICY "Members can manage their reviews" ON plant_course_reviews
  FOR ALL USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can view discussions" ON plant_discussions
  FOR SELECT USING (true);

CREATE POLICY "Members can create discussions" ON plant_discussions
  FOR INSERT WITH CHECK (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can manage their bookmarks" ON plant_bookmarks
  FOR ALL USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- Quizzes visible to enrolled members
CREATE POLICY "Enrolled members can view quizzes" ON plant_quizzes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM plant_modules m
      JOIN plant_enrollments e ON e.course_id = m.course_id
      WHERE m.id = module_id
      AND e.member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Enrolled members can view quiz questions" ON plant_quiz_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM plant_quizzes q
      JOIN plant_modules m ON m.id = q.module_id
      JOIN plant_enrollments e ON e.course_id = m.course_id
      WHERE q.id = quiz_id
      AND e.member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

-- Path courses junction visible
CREATE POLICY "Anyone can view path courses" ON plant_path_courses
  FOR SELECT USING (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update course counts when modules/lessons change
CREATE OR REPLACE FUNCTION update_course_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'plant_modules' THEN
    UPDATE plant_courses SET
      total_modules = (SELECT COUNT(*) FROM plant_modules WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)),
      updated_at = NOW()
    WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  ELSIF TG_TABLE_NAME = 'plant_lessons' THEN
    UPDATE plant_courses SET
      total_lessons = (
        SELECT COUNT(*) FROM plant_lessons l
        JOIN plant_modules m ON m.id = l.module_id
        WHERE m.course_id = (
          SELECT course_id FROM plant_modules WHERE id = COALESCE(NEW.module_id, OLD.module_id)
        )
      ),
      updated_at = NOW()
    WHERE id = (
      SELECT course_id FROM plant_modules WHERE id = COALESCE(NEW.module_id, OLD.module_id)
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_module_count
AFTER INSERT OR DELETE ON plant_modules
FOR EACH ROW EXECUTE FUNCTION update_course_counts();

CREATE TRIGGER trg_update_lesson_count
AFTER INSERT OR DELETE ON plant_lessons
FOR EACH ROW EXECUTE FUNCTION update_course_counts();

-- Function to update enrollment progress
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_enrollment_id UUID;
  v_course_id UUID;
  v_total_lessons INTEGER;
  v_completed_lessons INTEGER;
  v_progress DECIMAL(5,2);
BEGIN
  -- Get enrollment and course info
  SELECT e.id, e.course_id INTO v_enrollment_id, v_course_id
  FROM plant_enrollments e
  JOIN plant_modules m ON m.course_id = e.course_id
  JOIN plant_lessons l ON l.module_id = m.id
  WHERE l.id = NEW.lesson_id AND e.member_id = NEW.member_id
  LIMIT 1;

  IF v_enrollment_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate progress
  SELECT COUNT(*) INTO v_total_lessons
  FROM plant_lessons l
  JOIN plant_modules m ON m.id = l.module_id
  WHERE m.course_id = v_course_id;

  SELECT COUNT(*) INTO v_completed_lessons
  FROM plant_lesson_progress lp
  JOIN plant_lessons l ON l.id = lp.lesson_id
  JOIN plant_modules m ON m.id = l.module_id
  WHERE m.course_id = v_course_id
  AND lp.member_id = NEW.member_id
  AND lp.status = 'completed';

  v_progress := (v_completed_lessons::DECIMAL / NULLIF(v_total_lessons, 0)) * 100;

  -- Update enrollment
  UPDATE plant_enrollments SET
    progress_percent = COALESCE(v_progress, 0),
    last_accessed_at = NOW(),
    last_lesson_id = NEW.lesson_id,
    completed_at = CASE WHEN v_progress >= 100 THEN NOW() ELSE NULL END,
    status = CASE WHEN v_progress >= 100 THEN 'completed' ELSE 'active' END
  WHERE id = v_enrollment_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_enrollment_progress
AFTER INSERT OR UPDATE ON plant_lesson_progress
FOR EACH ROW EXECUTE FUNCTION update_enrollment_progress();

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.certificate_number := 'PLANT-' ||
    TO_CHAR(NOW(), 'YYYY') || '-' ||
    LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_certificate_number
BEFORE INSERT ON plant_certificates
FOR EACH ROW EXECUTE FUNCTION generate_certificate_number();

-- Function to update course rating
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE plant_courses SET
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM plant_course_reviews
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_course_rating
AFTER INSERT OR UPDATE OR DELETE ON plant_course_reviews
FOR EACH ROW EXECUTE FUNCTION update_course_rating();

-- ============================================
-- SEED DATA: Sample Learning Paths & Courses
-- ============================================

-- Insert sample instructors (if admin member exists)
INSERT INTO plant_instructors (member_id, title, specialty, credentials, is_active)
SELECT
  id,
  'Pastor',
  'Prophetic Ministry & Biblical Studies',
  'Founder of TPC Ministries',
  true
FROM members
WHERE is_admin = true
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample learning paths
INSERT INTO plant_learning_paths (slug, name, description, category, difficulty_level, ministry_id, required_tier, status, estimated_hours)
VALUES
  ('foundations-of-faith', 'Foundations of Faith', 'Build a strong foundation in your Christian walk through essential biblical teachings.', 'discipleship', 'beginner', 'general', 'free', 'published', 20),
  ('prophetic-development', 'Prophetic Development', 'Develop your prophetic gifting through structured learning and practical application.', 'prophetic', 'intermediate', 'tpc', 'partner', 'published', 40),
  ('kingdom-leadership', 'Kingdom Leadership', 'Develop leadership skills grounded in biblical principles for effective ministry.', 'leadership', 'advanced', 'general', 'covenant', 'draft', 60)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample courses
INSERT INTO plant_courses (slug, name, description, category, difficulty_level, ministry_id, required_tier, status, estimated_hours, has_certificate)
VALUES
  ('intro-to-bible', 'Introduction to the Bible', 'Learn how to study and understand God''s Word effectively.', 'bible-study', 'beginner', 'general', 'free', 'published', 8, true),
  ('prayer-foundations', 'Prayer Foundations', 'Discover the power and practice of effective prayer.', 'discipleship', 'beginner', 'general', 'free', 'published', 6, true),
  ('hearing-gods-voice', 'Hearing God''s Voice', 'Learn to recognize and respond to God''s leading in your life.', 'prophetic', 'beginner', 'tpc', 'partner', 'published', 10, true),
  ('prophetic-protocol', 'Prophetic Protocol', 'Understand proper order and etiquette in prophetic ministry.', 'prophetic', 'intermediate', 'tpc', 'partner', 'published', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- Link courses to learning paths
INSERT INTO plant_path_courses (learning_path_id, course_id, sequence_order, is_required)
SELECT
  lp.id,
  c.id,
  1,
  true
FROM plant_learning_paths lp, plant_courses c
WHERE lp.slug = 'foundations-of-faith' AND c.slug = 'intro-to-bible'
ON CONFLICT DO NOTHING;

INSERT INTO plant_path_courses (learning_path_id, course_id, sequence_order, is_required)
SELECT
  lp.id,
  c.id,
  2,
  true
FROM plant_learning_paths lp, plant_courses c
WHERE lp.slug = 'foundations-of-faith' AND c.slug = 'prayer-foundations'
ON CONFLICT DO NOTHING;

INSERT INTO plant_path_courses (learning_path_id, course_id, sequence_order, is_required)
SELECT
  lp.id,
  c.id,
  1,
  true
FROM plant_learning_paths lp, plant_courses c
WHERE lp.slug = 'prophetic-development' AND c.slug = 'hearing-gods-voice'
ON CONFLICT DO NOTHING;

INSERT INTO plant_path_courses (learning_path_id, course_id, sequence_order, is_required)
SELECT
  lp.id,
  c.id,
  2,
  true
FROM plant_learning_paths lp, plant_courses c
WHERE lp.slug = 'prophetic-development' AND c.slug = 'prophetic-protocol'
ON CONFLICT DO NOTHING;

-- Insert sample modules for "Introduction to the Bible" course
INSERT INTO plant_modules (course_id, slug, name, description, sequence_order, has_quiz)
SELECT
  id,
  'getting-started',
  'Getting Started with Scripture',
  'Understanding the basics of Bible study',
  1,
  true
FROM plant_courses WHERE slug = 'intro-to-bible'
ON CONFLICT DO NOTHING;

INSERT INTO plant_modules (course_id, slug, name, description, sequence_order, has_quiz)
SELECT
  id,
  'old-testament-overview',
  'Old Testament Overview',
  'Journey through the major themes of the Old Testament',
  2,
  true
FROM plant_courses WHERE slug = 'intro-to-bible'
ON CONFLICT DO NOTHING;

INSERT INTO plant_modules (course_id, slug, name, description, sequence_order, has_quiz)
SELECT
  id,
  'new-testament-overview',
  'New Testament Overview',
  'Explore the life of Christ and the early church',
  3,
  true
FROM plant_courses WHERE slug = 'intro-to-bible'
ON CONFLICT DO NOTHING;

-- Insert sample lessons
INSERT INTO plant_lessons (module_id, slug, name, description, sequence_order, content_type, estimated_minutes, content_html, scripture_references, is_preview)
SELECT
  id,
  'why-study-bible',
  'Why Study the Bible?',
  'Discover the life-changing power of God''s Word',
  1,
  'video',
  15,
  '<p>In this lesson, we explore why studying the Bible is essential for every believer.</p><h3>Key Points</h3><ul><li>The Bible is God''s inspired Word</li><li>Scripture transforms our minds and hearts</li><li>Regular Bible study builds spiritual foundation</li></ul>',
  ARRAY['2 Timothy 3:16-17', 'Hebrews 4:12', 'Psalm 119:105'],
  true
FROM plant_modules WHERE slug = 'getting-started'
ON CONFLICT DO NOTHING;

INSERT INTO plant_lessons (module_id, slug, name, description, sequence_order, content_type, estimated_minutes, content_html, scripture_references, is_preview)
SELECT
  id,
  'how-to-read-bible',
  'How to Read the Bible',
  'Practical methods for effective Bible reading',
  2,
  'text',
  20,
  '<p>Learn practical approaches to reading and understanding Scripture.</p><h3>Reading Methods</h3><ol><li><strong>Observation</strong> - What does the text say?</li><li><strong>Interpretation</strong> - What does it mean?</li><li><strong>Application</strong> - How does it apply to my life?</li></ol>',
  ARRAY['Joshua 1:8', 'Psalm 1:2-3'],
  false
FROM plant_modules WHERE slug = 'getting-started'
ON CONFLICT DO NOTHING;

INSERT INTO plant_lessons (module_id, slug, name, description, sequence_order, content_type, estimated_minutes, content_html, scripture_references, is_preview)
SELECT
  id,
  'bible-study-tools',
  'Bible Study Tools',
  'Resources to enhance your Bible study',
  3,
  'text',
  15,
  '<p>Explore various tools and resources that can deepen your understanding of Scripture.</p><h3>Recommended Tools</h3><ul><li>Concordances</li><li>Bible dictionaries</li><li>Commentaries</li><li>Study Bibles</li></ul>',
  ARRAY['Proverbs 2:1-5'],
  false
FROM plant_modules WHERE slug = 'getting-started'
ON CONFLICT DO NOTHING;

-- Create a sample quiz for the first module
INSERT INTO plant_quizzes (module_id, name, description, passing_score, max_attempts)
SELECT
  id,
  'Getting Started Quiz',
  'Test your understanding of Bible study basics',
  70,
  3
FROM plant_modules WHERE slug = 'getting-started'
ON CONFLICT DO NOTHING;

-- Add quiz questions
INSERT INTO plant_quiz_questions (quiz_id, question_type, question_text, options, explanation, points, sequence_order)
SELECT
  q.id,
  'multiple_choice',
  'According to 2 Timothy 3:16-17, Scripture is:',
  '[{"id": "a", "text": "A collection of human wisdom", "is_correct": false}, {"id": "b", "text": "God-breathed and useful for teaching", "is_correct": true}, {"id": "c", "text": "Only historical records", "is_correct": false}, {"id": "d", "text": "Optional for Christian growth", "is_correct": false}]'::jsonb,
  'Paul writes that "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness."',
  1,
  1
FROM plant_quizzes q
JOIN plant_modules m ON m.id = q.module_id
WHERE m.slug = 'getting-started'
ON CONFLICT DO NOTHING;

INSERT INTO plant_quiz_questions (quiz_id, question_type, question_text, options, explanation, points, sequence_order)
SELECT
  q.id,
  'true_false',
  'The Bible is described as a lamp to our feet and a light to our path.',
  NULL,
  'Psalm 119:105 states: "Your word is a lamp for my feet, a light on my path."',
  1,
  2
FROM plant_quizzes q
JOIN plant_modules m ON m.id = q.module_id
WHERE m.slug = 'getting-started'
ON CONFLICT DO NOTHING;

UPDATE plant_quiz_questions SET correct_answer = true
WHERE question_text LIKE '%lamp to our feet%';

COMMIT;
