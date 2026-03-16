-- ============================================
-- Kenya Pack the Mission — Supply Drive System
-- ============================================

-- 1. Supply Pledges (soft-commit item pledges)
CREATE TABLE kenya_supply_pledges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES kenya_trips(id) ON DELETE SET NULL,
  pledger_name TEXT NOT NULL,
  pledger_email TEXT,
  pledger_phone TEXT,
  category_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  estimated_value TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pledged' CHECK (status IN ('pledged', 'confirmed', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Supply Funds (monetary contributions)
CREATE TABLE kenya_supply_funds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES kenya_trips(id) ON DELETE SET NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  amount NUMERIC(10,2) NOT NULL,
  designation TEXT,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Sponsorships (school/orphan sponsorships)
CREATE TABLE kenya_sponsorships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES kenya_trips(id) ON DELETE SET NULL,
  sponsor_name TEXT NOT NULL,
  sponsor_email TEXT NOT NULL,
  sponsorship_type TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'one_time' CHECK (frequency IN ('one_time', 'monthly')),
  stripe_checkout_session_id TEXT,
  stripe_subscription_id TEXT,
  stripe_payment_intent TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'failed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_kenya_supply_pledges_trip_id ON kenya_supply_pledges(trip_id);
CREATE INDEX idx_kenya_supply_pledges_category ON kenya_supply_pledges(category_id);
CREATE INDEX idx_kenya_supply_pledges_status ON kenya_supply_pledges(status);

CREATE INDEX idx_kenya_supply_funds_trip_id ON kenya_supply_funds(trip_id);
CREATE INDEX idx_kenya_supply_funds_status ON kenya_supply_funds(status);
CREATE INDEX idx_kenya_supply_funds_stripe ON kenya_supply_funds(stripe_checkout_session_id);

CREATE INDEX idx_kenya_sponsorships_trip_id ON kenya_sponsorships(trip_id);
CREATE INDEX idx_kenya_sponsorships_status ON kenya_sponsorships(status);
CREATE INDEX idx_kenya_sponsorships_stripe ON kenya_sponsorships(stripe_checkout_session_id);

-- ============================================
-- Public Aggregate Views (no PII exposed)
-- ============================================
CREATE OR REPLACE VIEW kenya_supply_pledge_stats AS
SELECT
  category_id,
  item_name,
  COUNT(*) AS pledge_count,
  SUM(quantity) AS total_quantity
FROM kenya_supply_pledges
WHERE status IN ('pledged', 'confirmed', 'delivered')
GROUP BY category_id, item_name;

CREATE OR REPLACE VIEW kenya_supply_fund_stats AS
SELECT
  designation,
  COUNT(*) AS fund_count,
  SUM(amount) AS total_amount
FROM kenya_supply_funds
WHERE status = 'completed'
GROUP BY designation;

CREATE OR REPLACE VIEW kenya_sponsorship_stats AS
SELECT
  sponsorship_type,
  frequency,
  COUNT(*) AS sponsor_count,
  SUM(amount) AS total_amount
FROM kenya_sponsorships
WHERE status IN ('active', 'completed')
GROUP BY sponsorship_type, frequency;

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE kenya_supply_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE kenya_supply_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE kenya_sponsorships ENABLE ROW LEVEL SECURITY;

-- Admin full access on all 3 tables
CREATE POLICY "Admin full access on kenya_supply_pledges"
  ON kenya_supply_pledges FOR ALL
  USING (
    EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admin full access on kenya_supply_funds"
  ON kenya_supply_funds FOR ALL
  USING (
    EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admin full access on kenya_sponsorships"
  ON kenya_sponsorships FOR ALL
  USING (
    EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================
-- Updated_at triggers
-- ============================================
CREATE OR REPLACE FUNCTION update_kenya_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_kenya_supply_pledges_updated_at
  BEFORE UPDATE ON kenya_supply_pledges
  FOR EACH ROW EXECUTE FUNCTION update_kenya_updated_at();

CREATE TRIGGER set_kenya_supply_funds_updated_at
  BEFORE UPDATE ON kenya_supply_funds
  FOR EACH ROW EXECUTE FUNCTION update_kenya_updated_at();

CREATE TRIGGER set_kenya_sponsorships_updated_at
  BEFORE UPDATE ON kenya_sponsorships
  FOR EACH ROW EXECUTE FUNCTION update_kenya_updated_at();
