-- Add Kenya eTA (Electronic Travel Authorization) tracking
-- Required for all US travelers since Kenya eliminated traditional visas
ALTER TABLE kenya_trip_participants
  ADD COLUMN IF NOT EXISTS eta_status VARCHAR(30) DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS eta_application_date DATE,
  ADD COLUMN IF NOT EXISTS passport_valid_until DATE;
