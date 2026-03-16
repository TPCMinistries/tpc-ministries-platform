-- Kenya Invite System: Add Kenya-specific columns to invite_codes
ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS invite_type VARCHAR(30) DEFAULT 'general';
ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES kenya_trips(id);
ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS service_track VARCHAR(50);
ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS participant_id UUID REFERENCES kenya_trip_participants(id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invite_codes_invite_type ON invite_codes(invite_type);
CREATE INDEX IF NOT EXISTS idx_invite_codes_trip_id ON invite_codes(trip_id);
