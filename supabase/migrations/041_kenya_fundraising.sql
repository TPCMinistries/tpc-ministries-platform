-- Kenya Fundraising System Migration
-- Personal fundraising pages for Kenya trip participants
-- Created: 2025-01-25

-- ============================================
-- 1. ADD FUNDRAISING COLUMNS TO PARTICIPANTS
-- ============================================

-- Add fundraising-related columns to participants
ALTER TABLE public.kenya_trip_participants
ADD COLUMN IF NOT EXISTS fundraising_slug VARCHAR(100),
ADD COLUMN IF NOT EXISTS fundraising_page_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS fundraising_story TEXT,
ADD COLUMN IF NOT EXISTS fundraising_photo_url TEXT,
ADD COLUMN IF NOT EXISTS scholarship_requested BOOLEAN DEFAULT FALSE;

-- Add document URL columns
ALTER TABLE public.kenya_trip_participants
ADD COLUMN IF NOT EXISTS passport_document_url TEXT,
ADD COLUMN IF NOT EXISTS visa_document_url TEXT,
ADD COLUMN IF NOT EXISTS vaccination_document_url TEXT,
ADD COLUMN IF NOT EXISTS insurance_document_url TEXT,
ADD COLUMN IF NOT EXISTS medical_form_url TEXT;

-- Create unique index on fundraising_slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_kenya_participants_fundraising_slug
ON public.kenya_trip_participants(fundraising_slug)
WHERE fundraising_slug IS NOT NULL;

-- ============================================
-- 2. CREATE DONATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.kenya_trip_donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID REFERENCES public.kenya_trip_participants(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,

  -- Donor Info
  donor_name VARCHAR(200) NOT NULL,
  donor_email VARCHAR(255),
  is_anonymous BOOLEAN DEFAULT FALSE,
  show_name_publicly BOOLEAN DEFAULT TRUE,

  -- Amount Info
  amount DECIMAL(10,2) NOT NULL,
  fees_covered DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,

  -- Payment Info
  stripe_checkout_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  payment_method VARCHAR(50) DEFAULT 'stripe',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),

  -- Message
  message TEXT,

  -- Tracking
  is_manual_entry BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kenya_donations_participant ON public.kenya_trip_donations(participant_id);
CREATE INDEX IF NOT EXISTS idx_kenya_donations_trip ON public.kenya_trip_donations(trip_id);
CREATE INDEX IF NOT EXISTS idx_kenya_donations_status ON public.kenya_trip_donations(status);
CREATE INDEX IF NOT EXISTS idx_kenya_donations_stripe_session ON public.kenya_trip_donations(stripe_checkout_session_id);

-- Enable RLS
ALTER TABLE public.kenya_trip_donations ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access on kenya_trip_donations" ON public.kenya_trip_donations
FOR ALL USING (public.is_tpc_admin())
WITH CHECK (public.is_tpc_admin());

-- Participants can view their own donations
CREATE POLICY "Participants can view own donations" ON public.kenya_trip_donations
FOR SELECT USING (
  participant_id IN (
    SELECT id FROM public.kenya_trip_participants
    WHERE member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())
  )
);

-- Participants can insert manual donations for themselves
CREATE POLICY "Participants can add manual donations" ON public.kenya_trip_donations
FOR INSERT WITH CHECK (
  is_manual_entry = TRUE AND
  participant_id IN (
    SELECT id FROM public.kenya_trip_participants
    WHERE member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())
  )
);

-- ============================================
-- 3. AUTO-GENERATE FUNDRAISING SLUGS
-- ============================================

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_fundraising_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Only generate if slug is null and name exists
  IF NEW.fundraising_slug IS NULL AND NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL THEN
    base_slug := LOWER(CONCAT(NEW.first_name, '-', NEW.last_name));
    base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9-]', '', 'g');
    final_slug := base_slug;

    -- Check for uniqueness and append counter if needed
    WHILE EXISTS (
      SELECT 1 FROM public.kenya_trip_participants
      WHERE fundraising_slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;

    NEW.fundraising_slug := final_slug;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for slug generation
DROP TRIGGER IF EXISTS generate_participant_slug ON public.kenya_trip_participants;
CREATE TRIGGER generate_participant_slug
BEFORE INSERT OR UPDATE ON public.kenya_trip_participants
FOR EACH ROW EXECUTE FUNCTION generate_fundraising_slug();

-- Generate slugs for existing participants without them
UPDATE public.kenya_trip_participants
SET fundraising_slug = LOWER(CONCAT(first_name, '-', last_name))
WHERE fundraising_slug IS NULL;

-- ============================================
-- 4. AUTO-UPDATE AMOUNT RAISED
-- ============================================

-- Function to update participant's amount_raised
CREATE OR REPLACE FUNCTION update_participant_amount_raised()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.kenya_trip_participants
    SET amount_raised = COALESCE((
      SELECT SUM(net_amount)
      FROM public.kenya_trip_donations
      WHERE participant_id = OLD.participant_id
      AND status = 'completed'
    ), 0)
    WHERE id = OLD.participant_id;
    RETURN OLD;
  ELSE
    UPDATE public.kenya_trip_participants
    SET amount_raised = COALESCE((
      SELECT SUM(net_amount)
      FROM public.kenya_trip_donations
      WHERE participant_id = NEW.participant_id
      AND status = 'completed'
    ), 0)
    WHERE id = NEW.participant_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_amount_raised ON public.kenya_trip_donations;
CREATE TRIGGER update_amount_raised
AFTER INSERT OR UPDATE OR DELETE ON public.kenya_trip_donations
FOR EACH ROW EXECUTE FUNCTION update_participant_amount_raised();

-- ============================================
-- 5. PUBLIC FUNDRAISING VIEW
-- ============================================

-- Public view for fundraising pages (no sensitive data)
CREATE OR REPLACE VIEW public.kenya_trip_fundraising_public AS
SELECT
  p.id,
  p.trip_id,
  p.first_name,
  p.last_name,
  p.fundraising_slug,
  p.fundraising_page_enabled,
  p.fundraising_story,
  p.fundraising_photo_url,
  p.service_track,
  p.fundraising_goal,
  p.amount_raised,
  t.name as trip_name,
  t.start_date,
  t.end_date
FROM public.kenya_trip_participants p
JOIN public.kenya_trips t ON t.id = p.trip_id
WHERE p.application_status = 'approved'
AND p.fundraising_page_enabled = TRUE;

-- Grant select on public view
GRANT SELECT ON public.kenya_trip_fundraising_public TO anon, authenticated;

-- ============================================
-- 6. PUBLIC DONATIONS VIEW
-- ============================================

-- Public view for recent donations (for fundraising pages)
CREATE OR REPLACE VIEW public.kenya_trip_donations_public AS
SELECT
  d.id,
  d.participant_id,
  CASE WHEN d.is_anonymous THEN 'Anonymous' ELSE d.donor_name END as donor_name,
  d.is_anonymous,
  d.net_amount as amount,
  d.message,
  d.created_at
FROM public.kenya_trip_donations d
JOIN public.kenya_trip_participants p ON p.id = d.participant_id
WHERE d.status = 'completed'
AND d.show_name_publicly = TRUE
AND p.fundraising_page_enabled = TRUE;

GRANT SELECT ON public.kenya_trip_donations_public TO anon, authenticated;

-- ============================================
-- 7. STORAGE BUCKET FOR DOCUMENTS
-- ============================================

-- Note: Storage bucket creation should be done via Supabase dashboard or API
-- The following is a reference for what needs to be set up:
/*
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kenya-trip-documents',
  'kenya-trip-documents',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Storage policies
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'kenya-trip-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kenya-trip-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'kenya-trip-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can access all documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'kenya-trip-documents' AND
  public.is_tpc_admin()
);
*/

-- ============================================
-- 8. UPDATE TIMESTAMP TRIGGER FOR DONATIONS
-- ============================================

DROP TRIGGER IF EXISTS update_kenya_trip_donations_updated_at ON public.kenya_trip_donations;
CREATE TRIGGER update_kenya_trip_donations_updated_at
BEFORE UPDATE ON public.kenya_trip_donations
FOR EACH ROW EXECUTE FUNCTION update_kenya_updated_at();

-- ============================================
-- 9. POLICY FOR ANONYMOUS INSERT (WEBHOOK)
-- ============================================

-- Allow service role to insert/update donations (for Stripe webhook)
-- This is handled by using service_role key in the webhook handler

-- Allow public read of the fundraising public view
CREATE POLICY "Public can view fundraising pages" ON public.kenya_trip_participants
FOR SELECT USING (
  application_status = 'approved' AND
  fundraising_page_enabled = TRUE
);

COMMENT ON TABLE public.kenya_trip_donations IS 'Donations for Kenya trip participants';
COMMENT ON VIEW public.kenya_trip_fundraising_public IS 'Public-facing fundraising data for participants';
COMMENT ON VIEW public.kenya_trip_donations_public IS 'Public-facing donation feed for fundraising pages';
