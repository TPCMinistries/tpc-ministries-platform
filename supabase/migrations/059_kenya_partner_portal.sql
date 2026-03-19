-- ============================================================
-- Migration 059: Kenya Partner Portal
-- Tables for Kenya trip partners and their collaborative proposals
-- ============================================================

-- 1. Kenya trip partners table
CREATE TABLE IF NOT EXISTS kenya_trip_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES kenya_trips(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  partner_type VARCHAR(30) NOT NULL CHECK (partner_type IN (
    'host', 'coordinator', 'volunteer', 'staff', 'venue_contact', 'translator', 'driver', 'medical', 'security'
  )),
  organization VARCHAR(200),
  title VARCHAR(100),
  city VARCHAR(100),
  responsibilities TEXT,
  can_propose_changes BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  invited_by_member_id UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, member_id)
);

-- 2. Partner proposals table (collaborative change requests)
CREATE TABLE IF NOT EXISTS kenya_trip_partner_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES kenya_trips(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES kenya_trip_partners(id) ON DELETE CASCADE,
  proposal_type VARCHAR(30) NOT NULL CHECK (proposal_type IN (
    'schedule_change', 'logistics_update', 'venue_change',
    'resource_addition', 'announcement', 'other'
  )),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented')),
  admin_response TEXT,
  resolved_by_member_id UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE kenya_trip_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE kenya_trip_partner_proposals ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access on partners" ON kenya_trip_partners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on proposals" ON kenya_trip_partner_proposals FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_partners_trip ON kenya_trip_partners(trip_id);
CREATE INDEX idx_partners_member ON kenya_trip_partners(member_id);
CREATE INDEX idx_proposals_trip ON kenya_trip_partner_proposals(trip_id);
CREATE INDEX idx_proposals_partner ON kenya_trip_partner_proposals(partner_id);
CREATE INDEX idx_proposals_status ON kenya_trip_partner_proposals(status);

-- Updated timestamps
DROP TRIGGER IF EXISTS update_kenya_trip_partners_updated_at ON kenya_trip_partners;
CREATE TRIGGER update_kenya_trip_partners_updated_at
BEFORE UPDATE ON kenya_trip_partners
FOR EACH ROW EXECUTE FUNCTION update_kenya_updated_at();

DROP TRIGGER IF EXISTS update_kenya_trip_partner_proposals_updated_at ON kenya_trip_partner_proposals;
CREATE TRIGGER update_kenya_trip_partner_proposals_updated_at
BEFORE UPDATE ON kenya_trip_partner_proposals
FOR EACH ROW EXECUTE FUNCTION update_kenya_updated_at();
