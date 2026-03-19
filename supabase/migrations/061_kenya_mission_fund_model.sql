-- ============================================================
-- 061: Kenya Mission Fund Model
-- Separates ministry revenue tracking from delegate self-payments
-- Adds external_payment category for cash/Zelle payments
-- ============================================================

-- 1. New table: kenya_trip_mission_funds
-- Tracks incoming ministry revenue (church allocations, grants, sponsors, etc.)
CREATE TABLE IF NOT EXISTS kenya_trip_mission_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES kenya_trips(id) ON DELETE CASCADE,
  source_type VARCHAR(50) NOT NULL CHECK (source_type IN (
    'church_allocation', 'grant', 'corporate_sponsor', 'individual_donor',
    'fundraising_event', 'online_campaign', 'other'
  )),
  amount DECIMAL(10,2) NOT NULL,
  donor_name TEXT,
  description TEXT,
  received_date DATE DEFAULT CURRENT_DATE,
  created_by_member_id UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE kenya_trip_mission_funds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON kenya_trip_mission_funds FOR ALL USING (public.is_tpc_admin()) WITH CHECK (public.is_tpc_admin());
CREATE POLICY "Service role full access" ON kenya_trip_mission_funds FOR ALL USING (true) WITH CHECK (true);

-- Index
CREATE INDEX idx_mission_funds_trip ON kenya_trip_mission_funds(trip_id);

-- Updated timestamp trigger
CREATE TRIGGER update_kenya_trip_mission_funds_updated_at
BEFORE UPDATE ON kenya_trip_mission_funds
FOR EACH ROW EXECUTE FUNCTION update_kenya_updated_at();

-- 2. Add 'external_payment' to admin_payments category constraint
-- Drop and recreate the CHECK constraint to include external_payment
ALTER TABLE kenya_trip_admin_payments DROP CONSTRAINT IF EXISTS kenya_trip_admin_payments_category_check;
ALTER TABLE kenya_trip_admin_payments ADD CONSTRAINT kenya_trip_admin_payments_category_check
  CHECK (category IN (
    'flight_credit', 'hotel_credit', 'trip_sponsorship', 'church_gift',
    'scholarship', 'admin_adjustment', 'refund_credit', 'other',
    'external_payment'
  ));
