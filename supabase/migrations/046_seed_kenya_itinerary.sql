-- ============================================
-- Seed Kenya Trip Master Itinerary
-- Apr 21 – May 6, 2026 (16 days)
-- ============================================

DO $$
DECLARE v_trip_id UUID;
BEGIN
  SELECT id INTO v_trip_id FROM public.kenya_trips ORDER BY created_at DESC LIMIT 1;

  IF v_trip_id IS NOT NULL THEN
    -- Delete existing itinerary to avoid duplicates
    DELETE FROM public.kenya_trip_itinerary WHERE trip_id = v_trip_id;

    INSERT INTO public.kenya_trip_itinerary
      (trip_id, day_number, date, title, description, location, start_time, category)
    VALUES

    -- ========== DAY 1 — APR 21 — NEW YORK — Departure Day ==========
    (v_trip_id, 1, '2026-04-21', 'Team assembles at JFK Terminal 4',
     'Team assembles at JFK Terminal 4', 'New York', '16:00', 'all'),
    (v_trip_id, 1, '2026-04-21', 'Overnight to Nairobi',
     'Overnight to Nairobi. Ethiopian, Kenya Airways, Turkish recommended.', 'New York', '18:00', 'all'),

    -- ========== DAY 2 — APR 22 — NAIROBI — Arrival + Orientation ==========
    (v_trip_id, 2, '2026-04-22', 'Land at JKIA',
     'Land at JKIA. Customs, baggage, ground transfer to hotel.', 'Nairobi', '08:30', 'all'),
    (v_trip_id, 2, '2026-04-22', 'Hotel check-in. Rest + settle.',
     'Hotel check-in. Rest + settle. ❓ Hotel: confirm property + block.', 'Nairobi', '11:00', 'all'),
    (v_trip_id, 2, '2026-04-22', 'Team orientation dinner',
     'Evening: Team orientation dinner. Lorenzo sets tone, prayer, intros.', 'Nairobi', '18:00', 'all'),

    -- ========== DAY 3 — APR 23 — NAIROBI — Programming TBD ❓ ==========
    (v_trip_id, 3, '2026-04-23', 'Morning prayer + devotional',
     'Morning prayer + devotional. Minister Chaney leads.', 'Nairobi', '09:00', 'ministry'),
    (v_trip_id, 3, '2026-04-23', 'Pre-conference partner meetings',
     'Achumboro + Dr. Shem: pre-conference partner meetings.', 'Nairobi', '09:00', 'business'),
    (v_trip_id, 3, '2026-04-23', 'Site visit / partner briefing',
     'Dr. Griffith: site visit / partner briefing. ❓ Confirm health partner.', 'Nairobi', '09:00', 'healthcare'),
    (v_trip_id, 3, '2026-04-23', 'Education programming TBD',
     '❓ Programming TBD — confirm Ed/Tech lead first.', 'Nairobi', '09:00', 'education'),
    (v_trip_id, 3, '2026-04-23', 'Team debrief + final prep',
     'Evening: Team debrief. Final prep for Business Conference.', 'Nairobi', '18:00', 'all'),

    -- ========== DAY 4 — APR 24 — NAIROBI — NAIROBI BUSINESS CONFERENCE ==========
    (v_trip_id, 4, '2026-04-24', 'Early registration & setup',
     'Early registration & setup', 'Nairobi', '07:30', 'all'),
    (v_trip_id, 4, '2026-04-24', 'Full day conference',
     'Full day conference. See Conferences tab for run of show.', 'Nairobi', '09:00', 'business'),
    (v_trip_id, 4, '2026-04-24', 'Greeters + registration team needed',
     '❓ Greeters + registration team needed.', 'Nairobi', '12:15', 'all'),
    (v_trip_id, 4, '2026-04-24', 'Networking reception + pack for Kakamega',
     'Evening: Networking reception. Leadership debrief. Pack for Kakamega.', 'Nairobi', '18:00', 'all'),

    -- ========== DAY 5 — APR 25 — NAIROBI → KAKAMEGA — Travel Day ==========
    (v_trip_id, 5, '2026-04-25', 'Depart Nairobi for Kakamega',
     'Depart Nairobi. Ground transport or domestic flight. ~6 hrs by road.', 'Nairobi', '08:00', 'all'),
    (v_trip_id, 5, '2026-04-25', 'Arrive Kakamega',
     'Arrive Kakamega. Hotel check-in. ❓ Hotel: ask Caleb for recommendation.', 'Kakamega', '16:00', 'all'),
    (v_trip_id, 5, '2026-04-25', 'Welcome with Prophet Caleb + Rise Church Kenya',
     'Evening: Welcome with Prophet Caleb + Rise Church Kenya. Prayer walk.', 'Kakamega', '18:00', 'ministry'),

    -- ========== DAY 6 — APR 26 — KAKAMEGA — Sunday Service ==========
    (v_trip_id, 6, '2026-04-26', 'Full Sunday service',
     'Full Sunday service. Prophet Caleb leads. Delegation participates.', 'Kakamega', '09:00', 'ministry'),
    (v_trip_id, 6, '2026-04-26', 'Lorenzo brings the word',
     'Lorenzo brings the word. Minister Chaney supports.', 'Kakamega', '10:30', 'ministry'),
    (v_trip_id, 6, '2026-04-26', 'Afternoon programming TBD',
     '❓ Afternoon programming TBD — confirm with Prophet Caleb.', 'Kakamega', '14:00', 'all'),

    -- ========== DAY 7 — APR 27 — KAKAMEGA — Programming Day 1 ❓ ==========
    (v_trip_id, 7, '2026-04-27', 'Ministry programming',
     'Ministry programming — partner church visits, pastoral training', 'Kakamega', '09:00', 'ministry'),
    (v_trip_id, 7, '2026-04-27', 'Medical camp Day 1',
     'Medical camp Day 1 — Dr. Griffith leads', 'Kakamega', '09:00', 'healthcare'),
    (v_trip_id, 7, '2026-04-27', 'Education programming',
     '❓ Education programming — confirm scope', 'Kakamega', '09:00', 'education'),
    (v_trip_id, 7, '2026-04-27', 'Team dinner + debrief',
     'Team dinner + debrief', 'Kakamega', '18:00', 'all'),

    -- ========== DAY 8 — APR 28 — KAKAMEGA — Programming Day 2 ❓ ==========
    (v_trip_id, 8, '2026-04-28', 'Ministry programming continues',
     'Ministry programming continues', 'Kakamega', '09:00', 'ministry'),
    (v_trip_id, 8, '2026-04-28', 'Medical camp Day 2',
     'Medical camp Day 2', 'Kakamega', '09:00', 'healthcare'),
    (v_trip_id, 8, '2026-04-28', 'Education programming continues',
     'Education programming continues', 'Kakamega', '09:00', 'education'),
    (v_trip_id, 8, '2026-04-28', 'Team dinner + debrief',
     'Team dinner + debrief', 'Kakamega', '18:00', 'all'),

    -- ========== DAY 9 — APR 29 — KAKAMEGA — Programming Day 3 ❓ ==========
    (v_trip_id, 9, '2026-04-29', 'Programming continues — all tracks',
     'Programming continues — all tracks', 'Kakamega', '09:00', 'all'),
    (v_trip_id, 9, '2026-04-29', 'Team dinner + debrief',
     'Team dinner + debrief', 'Kakamega', '18:00', 'all'),

    -- ========== DAY 10 — APR 30 — KAKAMEGA — Programming Day 4 ❓ ==========
    (v_trip_id, 10, '2026-04-30', 'Final Kakamega programming',
     'Final Kakamega programming', 'Kakamega', '09:00', 'all'),
    (v_trip_id, 10, '2026-04-30', 'Pack and prepare for Mombasa travel',
     'Pack and prepare for Mombasa travel', 'Kakamega', '15:00', 'all'),
    (v_trip_id, 10, '2026-04-30', 'Farewell dinner with Kakamega partners',
     'Farewell dinner with Kakamega partners', 'Kakamega', '18:00', 'all'),

    -- ========== DAY 11 — MAY 1 — KAKAMEGA → MOMBASA — Travel Day ==========
    (v_trip_id, 11, '2026-05-01', 'Depart Kakamega for Mombasa',
     'Depart Kakamega for Mombasa. Domestic flight or road.', 'Kakamega', '08:00', 'all'),
    (v_trip_id, 11, '2026-05-01', 'Arrive Mombasa',
     'Arrive Mombasa. Hotel check-in.', 'Mombasa', '16:00', 'all'),
    (v_trip_id, 11, '2026-05-01', 'Beach/rest evening',
     'Beach/rest evening. Delegation free time.', 'Mombasa', '18:00', 'all'),

    -- ========== DAY 12 — MAY 2 — MOMBASA — Rest + Prep ==========
    (v_trip_id, 12, '2026-05-02', 'Free morning',
     'Free morning. Beach, rest, explore.', 'Mombasa', '10:00', 'all'),
    (v_trip_id, 12, '2026-05-02', 'Conference prep meeting',
     'Conference prep meeting. Run of show review.', 'Mombasa', '15:00', 'all'),
    (v_trip_id, 12, '2026-05-02', 'Team dinner',
     'Team dinner', 'Mombasa', '18:00', 'all'),

    -- ========== DAY 13 — MAY 3 — MOMBASA — MOMBASA CONFERENCE ==========
    (v_trip_id, 13, '2026-05-03', 'Post-church conference sessions',
     'Post-church conference sessions', 'Mombasa', '09:00', 'all'),
    (v_trip_id, 13, '2026-05-03', 'Conference lunch',
     'Conference lunch', 'Mombasa', '12:00', 'all'),
    (v_trip_id, 13, '2026-05-03', 'Afternoon sessions',
     'Afternoon sessions', 'Mombasa', '13:00', 'all'),
    (v_trip_id, 13, '2026-05-03', 'Closing ceremony + commitment call',
     'Closing ceremony + commitment call', 'Mombasa', '16:00', 'all'),
    (v_trip_id, 13, '2026-05-03', 'Reception + networking',
     'Reception + networking', 'Mombasa', '18:00', 'all'),

    -- ========== DAY 14 — MAY 4 — MOMBASA — Final Day ==========
    (v_trip_id, 14, '2026-05-04', 'Free morning. Sightseeing optional.',
     'Free morning. Sightseeing optional.', 'Mombasa', '10:00', 'all'),
    (v_trip_id, 14, '2026-05-04', 'Team final debrief + celebration',
     'Team final debrief + celebration', 'Mombasa', '15:00', 'all'),
    (v_trip_id, 14, '2026-05-04', 'Farewell dinner',
     'Farewell dinner', 'Mombasa', '18:00', 'all'),

    -- ========== DAY 15 — MAY 5 — MOMBASA → NAIROBI — Return Travel ==========
    (v_trip_id, 15, '2026-05-05', 'Depart Mombasa for Nairobi',
     'Depart Mombasa for Nairobi', 'Mombasa', '08:00', 'all'),
    (v_trip_id, 15, '2026-05-05', 'Arrive Nairobi',
     'Arrive Nairobi. Hotel check-in.', 'Nairobi', '16:00', 'all'),
    (v_trip_id, 15, '2026-05-05', 'Final team dinner. Reflections.',
     'Final team dinner. Reflections.', 'Nairobi', '18:00', 'all'),

    -- ========== DAY 16 — MAY 6 — NAIROBI — Departure ==========
    (v_trip_id, 16, '2026-05-06', 'Airport transfers begin',
     'Airport transfers begin', 'Nairobi', '06:00', 'all'),
    (v_trip_id, 16, '2026-05-06', 'Flights depart for home',
     'Flights depart for home. Safe travels!', 'Nairobi', '10:00', 'all')

    ;
  END IF;
END $$;
