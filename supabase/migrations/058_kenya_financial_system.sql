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

-- 4. Auto-update payment_status — reads from SOURCE tables to avoid trigger ordering issues
CREATE OR REPLACE FUNCTION update_participant_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  pid UUID;
  v_trip_cost DECIMAL(10,2);
  v_scholarship DECIMAL(10,2);
  v_paid DECIMAL(10,2);
  v_raised DECIMAL(10,2);
  v_credits DECIMAL(10,2);
  v_remaining DECIMAL(10,2);
  v_total_covered DECIMAL(10,2);
BEGIN
  pid := COALESCE(NEW.participant_id, OLD.participant_id);

  -- Get base fields from participant
  SELECT COALESCE(trip_cost, 3500), COALESCE(scholarship_amount, 0)
  INTO v_trip_cost, v_scholarship
  FROM kenya_trip_participants WHERE id = pid;

  -- Calculate from SOURCE tables (not denormalized columns) to avoid trigger ordering issues
  SELECT COALESCE(SUM(amount), 0) INTO v_paid
  FROM kenya_trip_payments WHERE participant_id = pid AND status = 'paid';

  SELECT COALESCE(SUM(net_amount), 0) INTO v_raised
  FROM kenya_trip_donations WHERE participant_id = pid AND status = 'completed';

  SELECT COALESCE(SUM(amount), 0) INTO v_credits
  FROM kenya_trip_admin_payments WHERE participant_id = pid;

  v_total_covered := v_paid + v_raised + v_credits;
  v_remaining := v_trip_cost - v_scholarship - v_total_covered;

  UPDATE kenya_trip_participants
  SET payment_status = CASE
    WHEN v_remaining <= 0 THEN 'paid'
    WHEN v_total_covered > 0 THEN 'partial'
    ELSE 'pending'
  END
  WHERE id = pid;

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
