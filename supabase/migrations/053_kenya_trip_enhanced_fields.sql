-- Migration 053: Enhanced fields for Kenya mission trip logistics
-- Adds: gender, preferred name, t-shirt, roommate, vaccinations, insurance, flights, medical, background

ALTER TABLE kenya_trip_participants
  ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
  ADD COLUMN IF NOT EXISTS preferred_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS t_shirt_size VARCHAR(10),
  ADD COLUMN IF NOT EXISTS roommate_preference VARCHAR(200),
  ADD COLUMN IF NOT EXISTS yellow_fever_status VARCHAR(30) DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS yellow_fever_date DATE,
  ADD COLUMN IF NOT EXISTS malaria_prophylaxis VARCHAR(100),
  ADD COLUMN IF NOT EXISTS travel_insurance_status VARCHAR(30) DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS travel_insurance_provider VARCHAR(200),
  ADD COLUMN IF NOT EXISTS arrival_flight_info VARCHAR(200),
  ADD COLUMN IF NOT EXISTS departure_flight_info VARCHAR(200),
  ADD COLUMN IF NOT EXISTS flight_confirmation_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS languages_spoken VARCHAR(200),
  ADD COLUMN IF NOT EXISTS prior_mission_experience VARCHAR(50),
  ADD COLUMN IF NOT EXISTS blood_type VARCHAR(10),
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS background_check_status VARCHAR(30) DEFAULT 'not_required',
  ADD COLUMN IF NOT EXISTS luggage_count INTEGER DEFAULT 0;
