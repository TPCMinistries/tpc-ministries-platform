-- ============================================
-- 045: Kenya Command Center UX Upgrade
-- Adds columns to participants/lodging, plus 4 new tables:
--   action_items, track_details, track_materials, admin_notes
-- ============================================

-- ============================================
-- 1A. ADD COLUMNS TO kenya_trip_participants
-- ============================================
ALTER TABLE public.kenya_trip_participants ADD COLUMN IF NOT EXISTS flight_status VARCHAR(20) DEFAULT 'not_booked';
ALTER TABLE public.kenya_trip_participants ADD COLUMN IF NOT EXISTS hotel_status VARCHAR(20) DEFAULT 'not_booked';
ALTER TABLE public.kenya_trip_participants ADD COLUMN IF NOT EXISTS booking_type VARCHAR(20) DEFAULT 'tbd';

-- ============================================
-- 1B. ADD booking_status TO kenya_trip_lodging
-- ============================================
ALTER TABLE public.kenya_trip_lodging ADD COLUMN IF NOT EXISTS booking_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE public.kenya_trip_lodging ADD COLUMN IF NOT EXISTS rate_per_night NUMERIC(10,2);
ALTER TABLE public.kenya_trip_lodging ADD COLUMN IF NOT EXISTS notes TEXT;

-- ============================================
-- 2. ACTION ITEMS
-- Operational task tracker (21 seeded items from HTML dashboard)
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_action_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  category VARCHAR(30) NOT NULL DEFAULT 'conference'
    CHECK (category IN ('conference', 'travel', 'people', 'programming', 'supplies', 'media')),
  assigned_to VARCHAR(255),
  due_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'done')),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('high', 'medium', 'low')),
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kenya_action_items_trip ON public.kenya_trip_action_items(trip_id);
CREATE INDEX idx_kenya_action_items_status ON public.kenya_trip_action_items(status);

-- ============================================
-- 3. TRACK DETAILS
-- Per-track objectives, scope, and notes
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_track_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  track VARCHAR(30) NOT NULL
    CHECK (track IN ('ministry', 'healthcare', 'business', 'education', 'media')),
  objectives TEXT DEFAULT '',
  scope TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(trip_id, track)
);

CREATE INDEX idx_kenya_track_details_trip ON public.kenya_trip_track_details(trip_id);

-- ============================================
-- 4. TRACK MATERIALS
-- Checklist items per track
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_track_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_detail_id UUID REFERENCES public.kenya_trip_track_details(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  is_checked BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kenya_track_materials_detail ON public.kenya_trip_track_materials(track_detail_id);

-- ============================================
-- 5. ADMIN NOTES
-- General notes, key contacts, and important links
-- ============================================
CREATE TABLE IF NOT EXISTS public.kenya_trip_admin_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  note_type VARCHAR(20) NOT NULL DEFAULT 'general'
    CHECK (note_type IN ('general', 'contact', 'link')),
  title VARCHAR(255),
  content TEXT,
  url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kenya_admin_notes_trip ON public.kenya_trip_admin_notes(trip_id);

-- ============================================
-- 6. RLS POLICIES
-- ============================================

-- Action Items
ALTER TABLE public.kenya_trip_action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to action items"
  ON public.kenya_trip_action_items FOR ALL
  USING (public.is_tpc_admin());

CREATE POLICY "Authenticated users can view action items"
  ON public.kenya_trip_action_items FOR SELECT
  USING (auth.role() = 'authenticated');

-- Track Details
ALTER TABLE public.kenya_trip_track_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to track details"
  ON public.kenya_trip_track_details FOR ALL
  USING (public.is_tpc_admin());

CREATE POLICY "Authenticated users can view track details"
  ON public.kenya_trip_track_details FOR SELECT
  USING (auth.role() = 'authenticated');

-- Track Materials
ALTER TABLE public.kenya_trip_track_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to track materials"
  ON public.kenya_trip_track_materials FOR ALL
  USING (public.is_tpc_admin());

CREATE POLICY "Authenticated users can view track materials"
  ON public.kenya_trip_track_materials FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admin Notes
ALTER TABLE public.kenya_trip_admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to admin notes"
  ON public.kenya_trip_admin_notes FOR ALL
  USING (public.is_tpc_admin());

-- ============================================
-- 7. SEED DATA - Action Items (21 operational tasks)
-- ============================================
DO $$
DECLARE
  v_trip_id UUID;
BEGIN
  SELECT id INTO v_trip_id FROM public.kenya_trips ORDER BY created_at DESC LIMIT 1;

  IF v_trip_id IS NOT NULL THEN
    INSERT INTO public.kenya_trip_action_items (trip_id, title, category, priority, sort_order) VALUES
      (v_trip_id, 'Finalize conference venue contracts (Nairobi + Mombasa)', 'conference', 'high', 1),
      (v_trip_id, 'Confirm AV equipment and tech setup for both venues', 'conference', 'high', 2),
      (v_trip_id, 'Secure conference speakers and panel moderators', 'conference', 'high', 3),
      (v_trip_id, 'Print conference programs and name badges', 'conference', 'medium', 4),
      (v_trip_id, 'Book group flights for delegation', 'travel', 'high', 5),
      (v_trip_id, 'Confirm individual flight bookings', 'travel', 'high', 6),
      (v_trip_id, 'Arrange airport transfers (NBO + MBA)', 'travel', 'medium', 7),
      (v_trip_id, 'Book hotel blocks in Nairobi and Mombasa', 'travel', 'high', 8),
      (v_trip_id, 'Arrange in-country transport (vans/buses)', 'travel', 'medium', 9),
      (v_trip_id, 'Collect all passports and verify expiry dates', 'people', 'high', 10),
      (v_trip_id, 'Process Kenya eVisa applications for all delegates', 'people', 'high', 11),
      (v_trip_id, 'Verify vaccination records (Yellow Fever)', 'people', 'medium', 12),
      (v_trip_id, 'Send pre-trip orientation packet to all delegates', 'people', 'medium', 13),
      (v_trip_id, 'Assign delegates to ministry tracks', 'people', 'medium', 14),
      (v_trip_id, 'Develop daily schedule and track-specific programming', 'programming', 'high', 15),
      (v_trip_id, 'Prepare ministry materials and teaching outlines', 'programming', 'medium', 16),
      (v_trip_id, 'Coordinate with in-country partners on local logistics', 'programming', 'high', 17),
      (v_trip_id, 'Order ministry supplies (Bibles, materials, gifts)', 'supplies', 'medium', 18),
      (v_trip_id, 'Pack medical supplies and first aid kits', 'supplies', 'medium', 19),
      (v_trip_id, 'Create social media content calendar for trip', 'media', 'medium', 20),
      (v_trip_id, 'Assign photographers/videographers to each track', 'media', 'low', 21)
    ON CONFLICT DO NOTHING;

    -- Seed Track Details (5 tracks)
    INSERT INTO public.kenya_trip_track_details (trip_id, track, objectives, scope, notes) VALUES
      (v_trip_id, 'ministry', 'Lead worship services, preach at conferences, conduct pastoral training sessions', 'Nairobi conference (Apr 24) + Mombasa conference (May 3) + local church visits', ''),
      (v_trip_id, 'healthcare', 'Provide health screenings, first aid training, and wellness education', 'Community health outreach in partnership with local clinics', ''),
      (v_trip_id, 'business', 'Entrepreneurship workshops, microfinance education, business mentoring', 'Conference workshops + one-on-one mentoring sessions', ''),
      (v_trip_id, 'education', 'Teach STEM, literacy, and leadership to youth and young adults', 'School visits + conference youth track sessions', ''),
      (v_trip_id, 'media', 'Document the trip, produce daily content, manage social media', 'Photography, videography, social media, and trip documentary', '')
    ON CONFLICT (trip_id, track) DO NOTHING;
  END IF;
END $$;
