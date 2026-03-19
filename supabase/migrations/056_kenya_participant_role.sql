-- Add role column for delegate/coordinator/admin designation
ALTER TABLE kenya_trip_participants
  ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'delegate';
