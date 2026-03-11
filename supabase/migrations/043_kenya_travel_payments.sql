-- Kenya Travel Form & Payment Plans Migration
-- Adds travel logistics fields, payment plan support, and form completion tracking
-- Created: 2026-03-11

-- ============================================
-- 1. TRAVEL & IDENTITY FIELDS ON PARTICIPANTS
-- ============================================

-- Display name / identity
ALTER TABLE public.kenya_trip_participants
ADD COLUMN IF NOT EXISTS honorific VARCHAR(20),
ADD COLUMN IF NOT EXISTS display_first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS display_last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS legal_full_name VARCHAR(255);

-- Contact / Organization
ALTER TABLE public.kenya_trip_participants
ADD COLUMN IF NOT EXISTS mailing_address TEXT,
ADD COLUMN IF NOT EXISTS organization VARCHAR(200),
ADD COLUMN IF NOT EXISTS org_title VARCHAR(100),
ADD COLUMN IF NOT EXISTS location VARCHAR(200);

-- Travel logistics
ALTER TABLE public.kenya_trip_participants
ADD COLUMN IF NOT EXISTS travel_accommodation_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS travel_accommodation_other TEXT,
ADD COLUMN IF NOT EXISTS travel_date_in DATE,
ADD COLUMN IF NOT EXISTS travel_date_out DATE,
ADD COLUMN IF NOT EXISTS departure_airport VARCHAR(200),
ADD COLUMN IF NOT EXISTS return_airport VARCHAR(200);

-- Accessibility
ALTER TABLE public.kenya_trip_participants
ADD COLUMN IF NOT EXISTS special_assistance VARCHAR(50) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS special_assistance_details TEXT,
ADD COLUMN IF NOT EXISTS tsa_known_traveler_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS travel_notes TEXT;

-- Payment plan fields
ALTER TABLE public.kenya_trip_participants
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'full',
ADD COLUMN IF NOT EXISTS trip_cost DECIMAL(10,2) DEFAULT 3500.00,
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_plan_months INTEGER;

-- Form completion tracking
ALTER TABLE public.kenya_trip_participants
ADD COLUMN IF NOT EXISTS interest_form_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS travel_form_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS medical_form_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS waiver_signed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_initiated_at TIMESTAMPTZ;

-- ============================================
-- 2. PAYMENT TRACKING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.kenya_trip_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID REFERENCES public.kenya_trip_participants(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,

  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  payment_number INTEGER,
  total_payments INTEGER,
  due_date DATE,
  description VARCHAR(255),

  -- Status
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'overdue', 'failed', 'refunded')),

  -- Stripe references
  stripe_payment_intent_id VARCHAR(255),
  stripe_invoice_id VARCHAR(255),
  stripe_checkout_session_id VARCHAR(255),
  payment_method VARCHAR(50) DEFAULT 'stripe',

  -- Timestamps
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kenya_payments_participant ON public.kenya_trip_payments(participant_id);
CREATE INDEX IF NOT EXISTS idx_kenya_payments_status ON public.kenya_trip_payments(status);
CREATE INDEX IF NOT EXISTS idx_kenya_payments_due_date ON public.kenya_trip_payments(due_date);

-- RLS
ALTER TABLE public.kenya_trip_payments ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access on kenya_trip_payments" ON public.kenya_trip_payments
FOR ALL USING (public.is_tpc_admin())
WITH CHECK (public.is_tpc_admin());

-- Participants can view their own payments
CREATE POLICY "Participants view own payments" ON public.kenya_trip_payments
FOR SELECT USING (
  participant_id IN (
    SELECT id FROM public.kenya_trip_participants
    WHERE member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())
  )
);

-- ============================================
-- 3. AUTO-UPDATE AMOUNT PAID ON PARTICIPANTS
-- ============================================

CREATE OR REPLACE FUNCTION update_participant_amount_paid()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.kenya_trip_participants
    SET amount_paid = COALESCE((
      SELECT SUM(amount)
      FROM public.kenya_trip_payments
      WHERE participant_id = OLD.participant_id
      AND status = 'paid'
    ), 0)
    WHERE id = OLD.participant_id;
    RETURN OLD;
  ELSE
    UPDATE public.kenya_trip_participants
    SET amount_paid = COALESCE((
      SELECT SUM(amount)
      FROM public.kenya_trip_payments
      WHERE participant_id = NEW.participant_id
      AND status = 'paid'
    ), 0)
    WHERE id = NEW.participant_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_amount_paid ON public.kenya_trip_payments;
CREATE TRIGGER update_amount_paid
AFTER INSERT OR UPDATE OR DELETE ON public.kenya_trip_payments
FOR EACH ROW EXECUTE FUNCTION update_participant_amount_paid();

-- ============================================
-- 4. UPDATE TIMESTAMP TRIGGER
-- ============================================

DROP TRIGGER IF EXISTS update_kenya_trip_payments_updated_at ON public.kenya_trip_payments;
CREATE TRIGGER update_kenya_trip_payments_updated_at
BEFORE UPDATE ON public.kenya_trip_payments
FOR EACH ROW EXECUTE FUNCTION update_kenya_updated_at();

-- ============================================
-- 5. ADMIN VIEW: PARTICIPANT COMPLETION STATUS
-- ============================================

CREATE OR REPLACE VIEW public.kenya_trip_participant_status AS
SELECT
  p.id,
  p.trip_id,
  p.first_name,
  p.last_name,
  p.email,
  p.phone,
  p.service_track,
  p.application_status,
  p.payment_status,
  p.trip_cost,
  p.amount_paid,
  p.fundraising_goal,
  p.amount_raised,
  -- Form completion flags
  p.interest_form_completed_at IS NOT NULL as interest_form_done,
  p.travel_form_completed_at IS NOT NULL as travel_form_done,
  p.medical_form_completed_at IS NOT NULL as medical_form_done,
  p.waiver_signed_at IS NOT NULL as waiver_done,
  p.payment_initiated_at IS NOT NULL as payment_started,
  -- Travel readiness
  p.passport_status,
  p.visa_status,
  p.travel_accommodation_type,
  p.departure_airport,
  p.return_airport,
  p.travel_date_in,
  p.travel_date_out,
  -- Timestamps
  p.interest_form_completed_at,
  p.travel_form_completed_at,
  p.application_date,
  p.created_at
FROM public.kenya_trip_participants p
ORDER BY p.last_name, p.first_name;

SELECT 'Kenya travel & payments migration complete!' as status;
