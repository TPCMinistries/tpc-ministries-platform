-- Track Health & Safety form completion separately from travel form
ALTER TABLE kenya_trip_participants
  ADD COLUMN IF NOT EXISTS health_safety_form_completed_at TIMESTAMPTZ;
