-- Kenya Travel Roster
-- Adds travel management fields for admin travel spreadsheet view

ALTER TABLE kenya_trip_participants
  ADD COLUMN IF NOT EXISTS travel_needed BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS travel_booked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_travel_notes TEXT,
  ADD COLUMN IF NOT EXISTS team_accommodation_notes TEXT;
