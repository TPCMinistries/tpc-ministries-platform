-- ============================================
-- TPC MINISTRIES PLATFORM - COMPLETE DATABASE SCHEMA
-- Project: tpc-ministries-platform
-- Project ID: naulwwnzrznslvhhxfed
--
-- Run this entire file in the Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. MEMBERS TABLE (Core)
-- ============================================
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'partner', 'covenant')),
  role VARCHAR(20) DEFAULT 'free' CHECK (role IN ('free', 'member', 'partner', 'staff', 'admin')),
  is_admin BOOLEAN DEFAULT FALSE,
  bio TEXT,
  location VARCHAR(255),
  country VARCHAR(100),
  joined_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  login_count INTEGER DEFAULT 0,
  role_updated_at TIMESTAMP,
  role_upgrade_reason TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  sms_opt_in BOOLEAN DEFAULT FALSE,
  email_opt_in BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);
CREATE INDEX IF NOT EXISTS idx_members_tier ON public.members(tier);
CREATE INDEX IF NOT EXISTS idx_members_is_admin ON public.members(is_admin);

-- ============================================
-- 2. DONATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('general', 'missions', 'leadership', 'building', 'tithe', 'offering')),
  frequency VARCHAR(20) DEFAULT 'once' CHECK (frequency IN ('once', 'monthly', 'weekly', 'yearly')),
  donor_email VARCHAR(255),
  donor_name VARCHAR(255) NOT NULL,
  donor_phone VARCHAR(50),
  stripe_session_id VARCHAR(255),
  stripe_payment_intent VARCHAR(255),
  stripe_invoice_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  subscription_status VARCHAR(50),
  payment_method VARCHAR(50),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donations_user_id ON public.donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON public.donations(created_at DESC);

-- ============================================
-- 3. TEACHINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.teachings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  speaker VARCHAR(100) DEFAULT 'Prophet Lorenzo',
  series VARCHAR(100),
  scripture_reference VARCHAR(255),
  video_url TEXT,
  audio_url TEXT,
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  tier_required VARCHAR(20) DEFAULT 'free' CHECK (tier_required IN ('free', 'partner', 'covenant')),
  category VARCHAR(50) CHECK (category IN ('sermon', 'teaching', 'prophecy', 'testimony', 'worship', 'other')),
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teachings_published ON public.teachings(published);
CREATE INDEX IF NOT EXISTS idx_teachings_published_at ON public.teachings(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_teachings_category ON public.teachings(category);

-- ============================================
-- 4. TEACHING PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.teaching_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  teaching_id UUID NOT NULL REFERENCES public.teachings(id) ON DELETE CASCADE,
  progress_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  last_watched_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, teaching_id)
);

CREATE INDEX IF NOT EXISTS idx_teaching_progress_user ON public.teaching_progress(user_id);

-- ============================================
-- 5. PRAYER REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) CHECK (category IN ('personal', 'family', 'health', 'finances', 'ministry', 'relationships', 'other')),
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_urgent BOOLEAN DEFAULT FALSE,
  is_answered BOOLEAN DEFAULT FALSE,
  answered_at TIMESTAMP,
  answer_testimony TEXT,
  prayer_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'answered', 'archived', 'private')),
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'members', 'leadership', 'private')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prayer_requests_user ON public.prayer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_status ON public.prayer_requests(status);

-- ============================================
-- 6. PRAYER SUPPORTERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.prayer_supporters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prayer_request_id UUID NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  prayed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(prayer_request_id, user_id)
);

-- ============================================
-- 7. EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(20) DEFAULT 'in-person' CHECK (event_type IN ('in-person', 'online', 'hybrid')),
  location VARCHAR(255),
  address TEXT,
  virtual_link TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  image_url TEXT,
  max_attendees INTEGER,
  registration_required BOOLEAN DEFAULT FALSE,
  registration_deadline TIMESTAMP,
  tier_required VARCHAR(20) DEFAULT 'free' CHECK (tier_required IN ('free', 'partner', 'covenant')),
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')),
  recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);

-- ============================================
-- 8. EVENT REGISTRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  attendance_type VARCHAR(20) DEFAULT 'in-person' CHECK (attendance_type IN ('in-person', 'virtual')),
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled', 'no-show')),
  checked_in_at TIMESTAMP,
  notes TEXT,
  registered_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON public.event_registrations(user_id);

-- ============================================
-- 9. PROPHECIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.prophecies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  prophet_name VARCHAR(100) DEFAULT 'Prophet Lorenzo',
  prophecy_date DATE,
  category VARCHAR(50) CHECK (category IN ('personal', 'church', 'nation', 'global', 'end-times', 'encouragement')),
  scripture_reference VARCHAR(255),
  image_url TEXT,
  audio_url TEXT,
  video_url TEXT,
  tier_required VARCHAR(20) DEFAULT 'free' CHECK (tier_required IN ('free', 'partner', 'covenant')),
  is_personal BOOLEAN DEFAULT FALSE,
  assigned_to UUID REFERENCES public.members(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prophecies_published ON public.prophecies(published);
CREATE INDEX IF NOT EXISTS idx_prophecies_date ON public.prophecies(prophecy_date DESC);
CREATE INDEX IF NOT EXISTS idx_prophecies_assigned ON public.prophecies(assigned_to);

-- ============================================
-- 10. ASSESSMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  instructions TEXT,
  category VARCHAR(50) CHECK (category IN ('spiritual', 'leadership', 'ministry', 'personal', 'gifts')),
  tier_required VARCHAR(20) DEFAULT 'free' CHECK (tier_required IN ('free', 'partner', 'covenant')),
  estimated_minutes INTEGER DEFAULT 10,
  questions JSONB NOT NULL DEFAULT '[]',
  results_config JSONB,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_slug ON public.assessments(slug);
CREATE INDEX IF NOT EXISTS idx_assessments_published ON public.assessments(published);

-- ============================================
-- 11. ASSESSMENT RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  score DECIMAL(5, 2),
  result_category VARCHAR(100),
  result_description TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_results_user ON public.assessment_results(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_assessment ON public.assessment_results(assessment_id);

-- ============================================
-- 12. RESOURCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'document' CHECK (type IN ('guide', 'worksheet', 'ebook', 'document', 'audio', 'video', 'other')),
  file_url TEXT,
  thumbnail_url TEXT,
  category VARCHAR(100),
  tags TEXT[],
  tier_required VARCHAR(20) DEFAULT 'free' CHECK (tier_required IN ('free', 'partner', 'covenant')),
  download_count INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_type ON public.resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_published ON public.resources(published);

-- ============================================
-- 13. MESSAGES TABLE (Two-way communication)
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('member', 'admin')),
  recipient_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('member', 'admin', 'leadership')),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(is_read) WHERE is_read = FALSE;

-- ============================================
-- 14. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(is_read) WHERE is_read = FALSE;

-- ============================================
-- 15. JOURNAL ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  scripture_reference VARCHAR(255),
  mood VARCHAR(50),
  tags TEXT[],
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_user ON public.journal_entries(user_id);

-- ============================================
-- 16. AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at DESC);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.members
    WHERE user_id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment prayer count
CREATE OR REPLACE FUNCTION increment_prayer_count(prayer_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.prayer_requests
  SET prayer_count = prayer_count + 1
  WHERE id = prayer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON public.donations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_teachings_updated_at BEFORE UPDATE ON public.teachings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_teaching_progress_updated_at BEFORE UPDATE ON public.teaching_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_prayer_requests_updated_at BEFORE UPDATE ON public.prayer_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON public.event_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_prophecies_updated_at BEFORE UPDATE ON public.prophecies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teaching_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prophecies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- MEMBERS POLICIES
-- ============================================
CREATE POLICY "Users can view their own profile" ON public.members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all members" ON public.members
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all members" ON public.members
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can insert members" ON public.members
  FOR INSERT WITH CHECK (is_admin() OR auth.uid() IS NOT NULL);

-- ============================================
-- TEACHINGS POLICIES
-- ============================================
CREATE POLICY "Anyone can view published teachings" ON public.teachings
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage teachings" ON public.teachings
  FOR ALL USING (is_admin());

-- ============================================
-- TEACHING PROGRESS POLICIES
-- ============================================
CREATE POLICY "Users can view their own progress" ON public.teaching_progress
  FOR SELECT USING (user_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own progress" ON public.teaching_progress
  FOR ALL USING (user_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

-- ============================================
-- PRAYER REQUESTS POLICIES
-- ============================================
CREATE POLICY "Users can view public prayer requests" ON public.prayer_requests
  FOR SELECT USING (status = 'active' AND visibility IN ('public', 'members'));

CREATE POLICY "Users can view their own prayer requests" ON public.prayer_requests
  FOR SELECT USING (user_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

CREATE POLICY "Users can create prayer requests" ON public.prayer_requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own prayer requests" ON public.prayer_requests
  FOR UPDATE USING (user_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all prayer requests" ON public.prayer_requests
  FOR ALL USING (is_admin());

-- ============================================
-- EVENTS POLICIES
-- ============================================
CREATE POLICY "Anyone can view upcoming events" ON public.events
  FOR SELECT USING (status IN ('upcoming', 'ongoing'));

CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL USING (is_admin());

-- ============================================
-- EVENT REGISTRATIONS POLICIES
-- ============================================
CREATE POLICY "Users can view their own registrations" ON public.event_registrations
  FOR SELECT USING (user_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

CREATE POLICY "Users can register for events" ON public.event_registrations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own registrations" ON public.event_registrations
  FOR UPDATE USING (user_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all registrations" ON public.event_registrations
  FOR ALL USING (is_admin());

-- ============================================
-- PROPHECIES POLICIES
-- ============================================
CREATE POLICY "Anyone can view published public prophecies" ON public.prophecies
  FOR SELECT USING (published = true AND is_personal = false);

CREATE POLICY "Users can view their personal prophecies" ON public.prophecies
  FOR SELECT USING (assigned_to IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage prophecies" ON public.prophecies
  FOR ALL USING (is_admin());

-- ============================================
-- ASSESSMENTS POLICIES
-- ============================================
CREATE POLICY "Anyone can view published assessments" ON public.assessments
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage assessments" ON public.assessments
  FOR ALL USING (is_admin());

-- ============================================
-- ASSESSMENT RESULTS POLICIES
-- ============================================
CREATE POLICY "Users can view their own results" ON public.assessment_results
  FOR SELECT USING (user_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

CREATE POLICY "Users can submit assessments" ON public.assessment_results
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can view all results" ON public.assessment_results
  FOR SELECT USING (is_admin());

-- ============================================
-- RESOURCES POLICIES
-- ============================================
CREATE POLICY "Anyone can view published resources" ON public.resources
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage resources" ON public.resources
  FOR ALL USING (is_admin());

-- ============================================
-- MESSAGES POLICIES
-- ============================================
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (
    sender_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())
    OR recipient_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can mark messages as read" ON public.messages
  FOR UPDATE USING (
    recipient_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all messages" ON public.messages
  FOR SELECT USING (is_admin());

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

-- ============================================
-- JOURNAL ENTRIES POLICIES
-- ============================================
CREATE POLICY "Users can manage their own journal" ON public.journal_entries
  FOR ALL USING (user_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

-- ============================================
-- DONATIONS POLICIES
-- ============================================
CREATE POLICY "Users can view their own donations" ON public.donations
  FOR SELECT USING (user_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can create donations" ON public.donations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all donations" ON public.donations
  FOR SELECT USING (is_admin());

-- ============================================
-- AUDIT LOG POLICIES
-- ============================================
CREATE POLICY "Admins can view audit log" ON public.audit_log
  FOR SELECT USING (is_admin());

CREATE POLICY "System can insert audit logs" ON public.audit_log
  FOR INSERT WITH CHECK (true);

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('tpc-media', 'tpc-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'tpc-media');

CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'tpc-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'tpc-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'tpc-media' AND auth.role() = 'authenticated');

-- ============================================
-- DONE! Your TPC Ministries database is ready.
-- ============================================
