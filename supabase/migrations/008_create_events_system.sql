-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL, -- 'conference', 'workshop', 'service', 'webinar', 'retreat'
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  is_virtual BOOLEAN DEFAULT false,
  virtual_link TEXT,
  capacity INTEGER, -- null = unlimited
  registration_deadline TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT false,
  featured_image_url TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  tier_access VARCHAR(20)[] DEFAULT ARRAY['free', 'partner', 'covenant']::VARCHAR[], -- which tiers can access
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'registered', -- 'registered', 'attended', 'cancelled', 'no_show'
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checked_in_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(event_id, member_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_published ON events(is_published);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_member ON event_registrations(member_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
-- Members can view published events
CREATE POLICY "Members can view published events"
  ON events FOR SELECT
  USING (is_published = true);

-- Admins can manage all events
CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.auth_user_id = auth.uid()
      AND members.role = 'admin'
    )
  );

-- RLS Policies for event_registrations
-- Members can view their own registrations
CREATE POLICY "Members can view own registrations"
  ON event_registrations FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );

-- Members can register for events
CREATE POLICY "Members can register for events"
  ON event_registrations FOR INSERT
  WITH CHECK (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );

-- Members can cancel their own registrations
CREATE POLICY "Members can cancel own registrations"
  ON event_registrations FOR UPDATE
  USING (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );

-- Admins can manage all registrations
CREATE POLICY "Admins can manage all registrations"
  ON event_registrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.auth_user_id = auth.uid()
      AND members.role = 'admin'
    )
  );

-- Add comments
COMMENT ON TABLE events IS 'Ministry events (conferences, workshops, services, etc.)';
COMMENT ON TABLE event_registrations IS 'Member registrations for events';
