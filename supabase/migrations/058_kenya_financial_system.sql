-- ============================================================
-- 058: Kenya Trip Financial System
-- Unified financial tracking: admin credits + payment status auto-update
-- ============================================================

-- 1. Admin payments table
CREATE TABLE IF NOT EXISTS kenya_trip_admin_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES kenya_trip_participants(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES kenya_trips(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'flight_credit', 'hotel_credit', 'trip_sponsorship', 'church_gift',
    'scholarship', 'admin_adjustment', 'refund_credit', 'other'
  )),
  description TEXT,
  created_by_member_id UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE kenya_trip_admin_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON kenya_trip_admin_payments FOR ALL USING (public.is_tpc_admin()) WITH CHECK (public.is_tpc_admin());
CREATE POLICY "Service role full access" ON kenya_trip_admin_payments FOR ALL USING (true) WITH CHECK (true);

-- Index
CREATE INDEX idx_admin_payments_participant ON kenya_trip_admin_payments(participant_id);

-- 2. Add admin_credits_total column to participants
ALTER TABLE kenya_trip_participants ADD COLUMN IF NOT EXISTS admin_credits_total DECIMAL(10,2) DEFAULT 0;

-- 3. Trigger to auto-sum admin payments
CREATE OR REPLACE FUNCTION update_participant_admin_credits()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE kenya_trip_participants
    SET admin_credits_total = COALESCE((
      SELECT SUM(amount) FROM kenya_trip_admin_payments
      WHERE participant_id = OLD.participant_id
    ), 0)
    WHERE id = OLD.participant_id;
    RETURN OLD;
  ELSE
    UPDATE kenya_trip_participants
    SET admin_credits_total = COALESCE((
      SELECT SUM(amount) FROM kenya_trip_admin_payments
      WHERE participant_id = NEW.participant_id
    ), 0)
    WHERE id = NEW.participant_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admin_credits ON kenya_trip_admin_payments;
CREATE TRIGGER update_admin_credits
AFTER INSERT OR UPDATE OR DELETE ON kenya_trip_admin_payments
FOR EACH ROW EXECUTE FUNCTION update_participant_admin_credits();

-- 4. Auto-update payment_status function that considers ALL sources
CREATE OR REPLACE FUNCTION update_participant_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  p_record RECORD;
  remaining DECIMAL(10,2);
BEGIN
  -- Get the participant_id from whatever table triggered this
  -- This function is called AFTER the individual sum triggers update their columns
  -- We need to recalculate based on the latest values

  IF TG_TABLE_NAME = 'kenya_trip_admin_payments' THEN
    SELECT trip_cost, scholarship_amount, amount_paid, amount_raised, admin_credits_total
    INTO p_record
    FROM kenya_trip_participants
    WHERE id = COALESCE(NEW.participant_id, OLD.participant_id);
  ELSIF TG_TABLE_NAME = 'kenya_trip_payments' THEN
    SELECT trip_cost, scholarship_amount, amount_paid, amount_raised, admin_credits_total
    INTO p_record
    FROM kenya_trip_participants
    WHERE id = COALESCE(NEW.participant_id, OLD.participant_id);
  ELSIF TG_TABLE_NAME = 'kenya_trip_donations' THEN
    SELECT trip_cost, scholarship_amount, amount_paid, amount_raised, admin_credits_total
    INTO p_record
    FROM kenya_trip_participants
    WHERE id = COALESCE(NEW.participant_id, OLD.participant_id);
  END IF;

  IF p_record IS NOT NULL THEN
    remaining := COALESCE(p_record.trip_cost, 3500)
      - COALESCE(p_record.scholarship_amount, 0)
      - COALESCE(p_record.amount_paid, 0)
      - COALESCE(p_record.amount_raised, 0)
      - COALESCE(p_record.admin_credits_total, 0);

    UPDATE kenya_trip_participants
    SET payment_status = CASE
      WHEN remaining <= 0 THEN 'paid'
      WHEN COALESCE(p_record.amount_paid, 0) + COALESCE(p_record.amount_raised, 0) + COALESCE(p_record.admin_credits_total, 0) > 0 THEN 'partial'
      ELSE 'pending'
    END
    WHERE id = COALESCE(NEW.participant_id, OLD.participant_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Add payment status auto-update triggers on ALL three payment source tables
DROP TRIGGER IF EXISTS auto_payment_status_admin ON kenya_trip_admin_payments;
CREATE TRIGGER auto_payment_status_admin
AFTER INSERT OR UPDATE OR DELETE ON kenya_trip_admin_payments
FOR EACH ROW EXECUTE FUNCTION update_participant_payment_status();

DROP TRIGGER IF EXISTS auto_payment_status_payments ON kenya_trip_payments;
CREATE TRIGGER auto_payment_status_payments
AFTER INSERT OR UPDATE OR DELETE ON kenya_trip_payments
FOR EACH ROW EXECUTE FUNCTION update_participant_payment_status();

DROP TRIGGER IF EXISTS auto_payment_status_donations ON kenya_trip_donations;
CREATE TRIGGER auto_payment_status_donations
AFTER INSERT OR UPDATE OR DELETE ON kenya_trip_donations
FOR EACH ROW EXECUTE FUNCTION update_participant_payment_status();

-- 5. Updated timestamp trigger
DROP TRIGGER IF EXISTS update_kenya_trip_admin_payments_updated_at ON kenya_trip_admin_payments;
CREATE TRIGGER update_kenya_trip_admin_payments_updated_at
BEFORE UPDATE ON kenya_trip_admin_payments
FOR EACH ROW EXECUTE FUNCTION update_kenya_updated_at();
