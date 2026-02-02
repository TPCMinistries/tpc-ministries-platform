-- Kenya Page Personalization Enhancement
-- Additional fields for personalizing fundraising pages
-- Created: 2025-01-25

-- Add more personalization columns to participants
ALTER TABLE public.kenya_trip_participants
ADD COLUMN IF NOT EXISTS fundraising_headline VARCHAR(200),
ADD COLUMN IF NOT EXISTS fundraising_video_url TEXT,
ADD COLUMN IF NOT EXISTS fundraising_why_going TEXT,
ADD COLUMN IF NOT EXISTS fundraising_personal_message TEXT;

-- Update the public view to include new fields
DROP VIEW IF EXISTS public.kenya_trip_fundraising_public;
CREATE VIEW public.kenya_trip_fundraising_public AS
SELECT
  p.id,
  p.trip_id,
  p.first_name,
  p.last_name,
  p.fundraising_slug,
  p.fundraising_page_enabled,
  p.fundraising_story,
  p.fundraising_photo_url,
  p.fundraising_headline,
  p.fundraising_video_url,
  p.fundraising_personal_message,
  p.service_track,
  p.fundraising_goal,
  p.amount_raised,
  t.name as trip_name,
  t.start_date,
  t.end_date
FROM public.kenya_trip_participants p
JOIN public.kenya_trips t ON t.id = p.trip_id
WHERE p.application_status = 'approved'
AND p.fundraising_page_enabled = TRUE;

-- Grant access
GRANT SELECT ON public.kenya_trip_fundraising_public TO anon, authenticated;

SELECT 'Kenya page personalization setup complete!' as status;
