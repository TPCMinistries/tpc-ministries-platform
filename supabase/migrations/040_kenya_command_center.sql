-- Kenya Command Center Migration
-- Kenya Kingdom Impact Trip 2026 (April 22 - May 8)
-- Created: 2025-01-25

-- ============================================
-- 1. KENYA TRIPS - Main trip metadata
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'registration_open', 'registration_closed', 'active', 'completed', 'cancelled')),
  fundraising_goal DECIMAL(10,2) DEFAULT 0,
  participant_goal INTEGER DEFAULT 0,
  registration_deadline DATE,
  payment_deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. KENYA TRIP PARTICIPANTS - Team roster
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,

  -- Personal Info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,

  -- Passport & Travel Documents
  passport_number VARCHAR(50),
  passport_expiry DATE,
  passport_status VARCHAR(20) DEFAULT 'pending' CHECK (passport_status IN ('pending', 'submitted', 'verified', 'expired', 'not_required')),
  visa_status VARCHAR(20) DEFAULT 'not_started' CHECK (visa_status IN ('not_started', 'in_progress', 'approved', 'denied', 'not_required')),
  passport_photo_url TEXT,

  -- Medical Information
  vaccinations JSONB DEFAULT '[]'::jsonb,
  allergies TEXT,
  medications TEXT,
  medical_conditions TEXT,
  dietary_restrictions TEXT,

  -- Emergency Contact
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(50),

  -- Assignment & Role
  service_track VARCHAR(50), -- medical, education, construction, evangelism, worship, admin
  ministry_role VARCHAR(100),
  team_leader BOOLEAN DEFAULT FALSE,
  city_assignment VARCHAR(100), -- Nairobi, Mombasa, etc.
  room_assignment_id UUID,

  -- Financial
  fundraising_goal DECIMAL(10,2) DEFAULT 0,
  amount_raised DECIMAL(10,2) DEFAULT 0,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  scholarship_amount DECIMAL(10,2) DEFAULT 0,

  -- Application Status
  application_status VARCHAR(20) DEFAULT 'pending' CHECK (application_status IN ('pending', 'approved', 'declined', 'waitlisted', 'withdrawn')),
  application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approval_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kenya_participants_trip ON public.kenya_trip_participants(trip_id);
CREATE INDEX idx_kenya_participants_member ON public.kenya_trip_participants(member_id);
CREATE INDEX idx_kenya_participants_status ON public.kenya_trip_participants(application_status);

-- ============================================
-- 3. KENYA TRIP ITINERARY - Day-by-day schedule
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_itinerary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date DATE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  start_time TIME,
  end_time TIME,
  category VARCHAR(50) CHECK (category IN ('travel', 'ministry', 'meals', 'lodging', 'free_time', 'meeting', 'event', 'other')),
  notes TEXT,
  is_flex BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kenya_itinerary_trip ON public.kenya_trip_itinerary(trip_id);
CREATE INDEX idx_kenya_itinerary_date ON public.kenya_trip_itinerary(date);

-- ============================================
-- 4. KENYA TRIP FLIGHTS - Flight tracking
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_flights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  flight_type VARCHAR(20) NOT NULL CHECK (flight_type IN ('group', 'individual')),
  direction VARCHAR(20) NOT NULL CHECK (direction IN ('outbound', 'return', 'internal')),

  -- Flight Details
  airline VARCHAR(100),
  flight_number VARCHAR(20),
  departure_airport VARCHAR(10),
  arrival_airport VARCHAR(10),
  departure_datetime TIMESTAMP WITH TIME ZONE,
  arrival_datetime TIMESTAMP WITH TIME ZONE,

  -- Booking Info
  confirmation_number VARCHAR(50),
  booking_status VARCHAR(20) DEFAULT 'pending' CHECK (booking_status IN ('pending', 'booked', 'confirmed', 'checked_in', 'completed', 'cancelled')),
  cost_per_person DECIMAL(10,2),
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participant-Flight assignment (for individual flights or group flight roster)
CREATE TABLE IF NOT EXISTS public.kenya_trip_flight_passengers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flight_id UUID REFERENCES public.kenya_trip_flights(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.kenya_trip_participants(id) ON DELETE CASCADE,
  seat_number VARCHAR(10),
  checked_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kenya_flights_trip ON public.kenya_trip_flights(trip_id);

-- ============================================
-- 5. KENYA TRIP LODGING - Accommodations
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_lodging (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Kenya',

  -- Contact
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),

  -- Booking Details
  check_in_date DATE,
  check_out_date DATE,
  confirmation_number VARCHAR(50),
  total_rooms INTEGER,
  cost_per_night DECIMAL(10,2),

  -- Amenities
  amenities JSONB DEFAULT '[]'::jsonb,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room assignments
CREATE TABLE IF NOT EXISTS public.kenya_trip_room_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lodging_id UUID REFERENCES public.kenya_trip_lodging(id) ON DELETE CASCADE,
  room_number VARCHAR(20),
  room_type VARCHAR(50), -- single, double, triple, quad
  participant_ids UUID[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kenya_lodging_trip ON public.kenya_trip_lodging(trip_id);

-- ============================================
-- 6. KENYA TRIP CONTACTS - Local hosts, translators, drivers
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  role VARCHAR(100) NOT NULL, -- host, translator, driver, pastor, coordinator, medical, security
  organization VARCHAR(200),

  -- Contact Info
  phone VARCHAR(20),
  phone_alt VARCHAR(20),
  email VARCHAR(255),
  whatsapp VARCHAR(20),

  -- Location
  city VARCHAR(100),
  region VARCHAR(100),

  -- Assignment
  assigned_dates DATE[],
  notes TEXT,
  is_primary BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kenya_contacts_trip ON public.kenya_trip_contacts(trip_id);
CREATE INDEX idx_kenya_contacts_role ON public.kenya_trip_contacts(role);

-- ============================================
-- 7. KENYA TRIP BUDGET CATEGORIES - Budget line items
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_budget_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  budgeted_amount DECIMAL(10,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kenya_budget_trip ON public.kenya_trip_budget_categories(trip_id);

-- ============================================
-- 8. KENYA TRIP EXPENSES - Expense tracking
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.kenya_trip_budget_categories(id) ON DELETE SET NULL,

  -- Expense Details
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  expense_date DATE NOT NULL,

  -- Payment Info
  paid_by VARCHAR(200),
  payment_method VARCHAR(50),
  receipt_url TEXT,

  -- Approval Workflow
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid', 'reimbursed')),
  approved_by UUID REFERENCES public.members(id),
  approved_at TIMESTAMP WITH TIME ZONE,

  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kenya_expenses_trip ON public.kenya_trip_expenses(trip_id);
CREATE INDEX idx_kenya_expenses_category ON public.kenya_trip_expenses(category_id);
CREATE INDEX idx_kenya_expenses_status ON public.kenya_trip_expenses(status);

-- ============================================
-- 9. KENYA TRIP ANNOUNCEMENTS - Team communications
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'leaders', 'medical', 'education', 'construction', 'evangelism', 'worship', 'admin')),

  -- Scheduling
  publish_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_pinned BOOLEAN DEFAULT FALSE,

  -- Author
  created_by UUID REFERENCES public.members(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kenya_announcements_trip ON public.kenya_trip_announcements(trip_id);

-- ============================================
-- 10. KENYA TRIP DOCUMENTS - Document library
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- forms, guides, medical, travel, ministry, training, other
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  is_required BOOLEAN DEFAULT FALSE,
  target_audience VARCHAR(50) DEFAULT 'all',
  sort_order INTEGER DEFAULT 0,

  uploaded_by UUID REFERENCES public.members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kenya_documents_trip ON public.kenya_trip_documents(trip_id);

-- ============================================
-- 11. KENYA TRIP FAQS - Frequently asked questions
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(50), -- general, travel, medical, packing, ministry, financial, other
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kenya_faqs_trip ON public.kenya_trip_faqs(trip_id);

-- ============================================
-- 12. KENYA TRIP DAILY FOCUS - Prayer themes, scripture
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_daily_focus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  focus_date DATE NOT NULL,
  phase VARCHAR(20) NOT NULL CHECK (phase IN ('pre_trip', 'during_trip', 'post_trip')),

  -- Content
  theme VARCHAR(255) NOT NULL,
  scripture_reference VARCHAR(100),
  scripture_text TEXT,
  prayer_focus TEXT,
  leadership_notes TEXT,
  devotional_content TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(trip_id, focus_date)
);

CREATE INDEX idx_kenya_daily_focus_trip ON public.kenya_trip_daily_focus(trip_id);
CREATE INDEX idx_kenya_daily_focus_date ON public.kenya_trip_daily_focus(focus_date);

-- ============================================
-- 13. KENYA TRIP CHECKINS - Daily attendance
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.kenya_trip_participants(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  checkin_time TIME,
  checkin_type VARCHAR(20) DEFAULT 'morning' CHECK (checkin_type IN ('morning', 'evening', 'activity', 'departure', 'arrival')),
  location VARCHAR(255),
  status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'excused', 'late')),
  notes TEXT,
  recorded_by UUID REFERENCES public.members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(trip_id, participant_id, checkin_date, checkin_type)
);

CREATE INDEX idx_kenya_checkins_trip ON public.kenya_trip_checkins(trip_id);
CREATE INDEX idx_kenya_checkins_participant ON public.kenya_trip_checkins(participant_id);
CREATE INDEX idx_kenya_checkins_date ON public.kenya_trip_checkins(checkin_date);

-- ============================================
-- 14. KENYA TRIP PACKING ITEMS - Packing checklist
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_packing_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- documents, clothing, toiletries, medical, electronics, ministry, other
  description TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kenya_packing_items_trip ON public.kenya_trip_packing_items(trip_id);

-- ============================================
-- 15. KENYA TRIP PACKING STATUS - Per-person progress
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_packing_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID REFERENCES public.kenya_trip_participants(id) ON DELETE CASCADE,
  packing_item_id UUID REFERENCES public.kenya_trip_packing_items(id) ON DELETE CASCADE,
  is_packed BOOLEAN DEFAULT FALSE,
  packed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(participant_id, packing_item_id)
);

CREATE INDEX idx_kenya_packing_status_participant ON public.kenya_trip_packing_status(participant_id);

-- ============================================
-- SEED: Initial Kenya Trip 2026
-- ============================================
INSERT INTO public.kenya_trips (
  name,
  description,
  start_date,
  end_date,
  status,
  fundraising_goal,
  participant_goal,
  registration_deadline
) VALUES (
  'Kenya Kingdom Impact Trip 2026',
  'Annual missions trip to Kenya serving communities through medical care, education, construction, and evangelism.',
  '2026-04-22',
  '2026-05-08',
  'planning',
  50000.00,
  25,
  '2026-02-28'
) ON CONFLICT DO NOTHING;

-- Seed default budget categories
INSERT INTO public.kenya_trip_budget_categories (trip_id, name, description, budgeted_amount, sort_order)
SELECT
  id,
  category_name,
  category_desc,
  budget_amt,
  sort_ord
FROM public.kenya_trips
CROSS JOIN (VALUES
  ('Airfare', 'International and domestic flights', 20000.00, 1),
  ('Lodging', 'Hotels and accommodations', 8000.00, 2),
  ('Ground Transport', 'Buses, vans, drivers', 3000.00, 3),
  ('Meals', 'Team meals and catering', 4000.00, 4),
  ('Ministry Supplies', 'Outreach materials, equipment', 5000.00, 5),
  ('Medical Supplies', 'Medical clinic supplies', 3000.00, 6),
  ('Local Partnerships', 'Donations to local ministries', 2000.00, 7),
  ('Insurance', 'Travel and medical insurance', 2000.00, 8),
  ('Contingency', 'Emergency fund', 3000.00, 9)
) AS cats(category_name, category_desc, budget_amt, sort_ord)
WHERE public.kenya_trips.name = 'Kenya Kingdom Impact Trip 2026'
ON CONFLICT DO NOTHING;

-- Seed default packing items
INSERT INTO public.kenya_trip_packing_items (trip_id, item_name, category, is_required, sort_order)
SELECT
  id,
  item,
  cat,
  required,
  ord
FROM public.kenya_trips
CROSS JOIN (VALUES
  -- Documents (required)
  ('Valid Passport', 'documents', true, 1),
  ('Kenya Visa', 'documents', true, 2),
  ('Flight Itinerary', 'documents', true, 3),
  ('Travel Insurance Card', 'documents', true, 4),
  ('Vaccination Records', 'documents', true, 5),
  ('Emergency Contact Info', 'documents', true, 6),

  -- Clothing
  ('Modest Clothing (long pants/skirts)', 'clothing', true, 10),
  ('Light Jacket/Sweater', 'clothing', false, 11),
  ('Comfortable Walking Shoes', 'clothing', true, 12),
  ('Hat/Sun Protection', 'clothing', false, 13),
  ('Rain Jacket', 'clothing', false, 14),

  -- Toiletries
  ('Sunscreen (SPF 30+)', 'toiletries', true, 20),
  ('Insect Repellent (DEET)', 'toiletries', true, 21),
  ('Hand Sanitizer', 'toiletries', true, 22),
  ('Personal Medications', 'toiletries', true, 23),

  -- Medical
  ('First Aid Kit', 'medical', false, 30),
  ('Prescription Medications', 'medical', true, 31),
  ('Malaria Prophylaxis', 'medical', true, 32),

  -- Electronics
  ('Phone + Charger', 'electronics', true, 40),
  ('Power Adapter (Type G)', 'electronics', true, 41),
  ('Portable Battery Pack', 'electronics', false, 42),

  -- Ministry
  ('Bible', 'ministry', true, 50),
  ('Journal/Notebook', 'ministry', false, 51),
  ('Ministry Materials', 'ministry', false, 52)
) AS items(item, cat, required, ord)
WHERE public.kenya_trips.name = 'Kenya Kingdom Impact Trip 2026'
ON CONFLICT DO NOTHING;

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.kenya_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_itinerary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_flight_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_lodging ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_room_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_daily_focus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_packing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_trip_packing_status ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - Admin full access
-- ============================================

-- Helper function to check if user is admin/staff
CREATE OR REPLACE FUNCTION public.is_tpc_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.members
    WHERE user_id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'staff'))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply policies to all Kenya tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'kenya_trips',
      'kenya_trip_participants',
      'kenya_trip_itinerary',
      'kenya_trip_flights',
      'kenya_trip_flight_passengers',
      'kenya_trip_lodging',
      'kenya_trip_room_assignments',
      'kenya_trip_contacts',
      'kenya_trip_budget_categories',
      'kenya_trip_expenses',
      'kenya_trip_announcements',
      'kenya_trip_documents',
      'kenya_trip_faqs',
      'kenya_trip_daily_focus',
      'kenya_trip_checkins',
      'kenya_trip_packing_items',
      'kenya_trip_packing_status'
    ])
  LOOP
    -- Admin full access policy
    EXECUTE format('
      CREATE POLICY "Admin full access on %I" ON public.%I
      FOR ALL USING (public.is_tpc_admin())
      WITH CHECK (public.is_tpc_admin())
    ', tbl, tbl);
  END LOOP;
END $$;

-- Participants can view their own data
CREATE POLICY "Participants can view own data" ON public.kenya_trip_participants
FOR SELECT USING (
  member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())
);

-- Participants can view trip announcements
CREATE POLICY "Participants can view announcements" ON public.kenya_trip_announcements
FOR SELECT USING (
  trip_id IN (
    SELECT trip_id FROM public.kenya_trip_participants
    WHERE member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())
    AND application_status = 'approved'
  )
);

-- Participants can view documents
CREATE POLICY "Participants can view documents" ON public.kenya_trip_documents
FOR SELECT USING (
  trip_id IN (
    SELECT trip_id FROM public.kenya_trip_participants
    WHERE member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())
    AND application_status = 'approved'
  )
);

-- Participants can view their packing status
CREATE POLICY "Participants can manage own packing" ON public.kenya_trip_packing_status
FOR ALL USING (
  participant_id IN (
    SELECT id FROM public.kenya_trip_participants
    WHERE member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())
  )
);

-- Public can view published FAQs
CREATE POLICY "Public can view FAQs" ON public.kenya_trip_faqs
FOR SELECT USING (is_published = true);

-- ============================================
-- UPDATE TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_kenya_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'kenya_trips',
      'kenya_trip_participants',
      'kenya_trip_itinerary',
      'kenya_trip_flights',
      'kenya_trip_lodging',
      'kenya_trip_contacts',
      'kenya_trip_budget_categories',
      'kenya_trip_expenses',
      'kenya_trip_announcements',
      'kenya_trip_documents',
      'kenya_trip_faqs',
      'kenya_trip_daily_focus',
      'kenya_trip_packing_items'
    ])
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
      CREATE TRIGGER update_%I_updated_at
      BEFORE UPDATE ON public.%I
      FOR EACH ROW EXECUTE FUNCTION update_kenya_updated_at()
    ', tbl, tbl, tbl, tbl);
  END LOOP;
END $$;

-- ============================================
-- VIEWS for dashboard
-- ============================================

-- Participant summary view
CREATE OR REPLACE VIEW public.kenya_trip_participant_summary AS
SELECT
  p.trip_id,
  COUNT(*) FILTER (WHERE p.application_status = 'approved') as approved_count,
  COUNT(*) FILTER (WHERE p.application_status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE p.application_status = 'waitlisted') as waitlisted_count,
  COUNT(*) FILTER (WHERE p.team_leader = true) as leader_count,
  SUM(p.amount_raised) as total_raised,
  SUM(p.fundraising_goal) as total_goal,
  COUNT(*) FILTER (WHERE p.passport_status = 'verified') as passports_verified,
  COUNT(*) FILTER (WHERE p.visa_status = 'approved') as visas_approved,
  COUNT(*) FILTER (WHERE p.payment_status = 'paid') as fully_paid
FROM public.kenya_trip_participants p
GROUP BY p.trip_id;

-- Budget summary view
CREATE OR REPLACE VIEW public.kenya_trip_budget_summary AS
SELECT
  bc.trip_id,
  bc.id as category_id,
  bc.name as category_name,
  bc.budgeted_amount,
  COALESCE(SUM(e.amount) FILTER (WHERE e.status IN ('approved', 'paid', 'reimbursed')), 0) as spent_amount,
  bc.budgeted_amount - COALESCE(SUM(e.amount) FILTER (WHERE e.status IN ('approved', 'paid', 'reimbursed')), 0) as remaining
FROM public.kenya_trip_budget_categories bc
LEFT JOIN public.kenya_trip_expenses e ON e.category_id = bc.id
GROUP BY bc.id, bc.trip_id, bc.name, bc.budgeted_amount;

COMMENT ON TABLE public.kenya_trips IS 'Kenya mission trip metadata and configuration';
COMMENT ON TABLE public.kenya_trip_participants IS 'Team roster with personal, travel, medical, and financial info';
COMMENT ON TABLE public.kenya_trip_itinerary IS 'Day-by-day trip schedule';
COMMENT ON TABLE public.kenya_trip_flights IS 'Flight bookings for team travel';
COMMENT ON TABLE public.kenya_trip_lodging IS 'Accommodation bookings';
COMMENT ON TABLE public.kenya_trip_contacts IS 'Local hosts, translators, drivers';
COMMENT ON TABLE public.kenya_trip_budget_categories IS 'Budget line items';
COMMENT ON TABLE public.kenya_trip_expenses IS 'Expense tracking with approval workflow';
COMMENT ON TABLE public.kenya_trip_announcements IS 'Team communications';
COMMENT ON TABLE public.kenya_trip_documents IS 'Document library';
COMMENT ON TABLE public.kenya_trip_faqs IS 'Frequently asked questions';
COMMENT ON TABLE public.kenya_trip_daily_focus IS 'Daily prayer themes and scripture';
COMMENT ON TABLE public.kenya_trip_checkins IS 'Daily attendance tracking';
COMMENT ON TABLE public.kenya_trip_packing_items IS 'Packing checklist items';
COMMENT ON TABLE public.kenya_trip_packing_status IS 'Per-person packing progress';
