-- ============================================
-- 049: Daily Check-In, Impact Logging, Reflections
-- Pre-trip readiness + on-ground safety + post-trip reporting
-- ============================================

-- Daily check-in (safety accountability)
CREATE TABLE IF NOT EXISTS public.kenya_trip_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.kenya_trip_participants(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood VARCHAR(20) DEFAULT 'good',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_id, check_in_date)
);

CREATE INDEX IF NOT EXISTS idx_kenya_checkins_trip ON public.kenya_trip_checkins(trip_id);
CREATE INDEX IF NOT EXISTS idx_kenya_checkins_date ON public.kenya_trip_checkins(check_in_date);

ALTER TABLE public.kenya_trip_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access checkins"
  ON public.kenya_trip_checkins FOR ALL
  USING (public.is_tpc_admin());

CREATE POLICY "Members can read own checkins"
  ON public.kenya_trip_checkins FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Members can create checkins"
  ON public.kenya_trip_checkins FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Impact logs (service tracking)
CREATE TABLE IF NOT EXISTS public.kenya_trip_impact_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.kenya_trip_participants(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  description TEXT NOT NULL,
  people_count INTEGER DEFAULT 0,
  city VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kenya_impact_trip ON public.kenya_trip_impact_logs(trip_id);

ALTER TABLE public.kenya_trip_impact_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access impact"
  ON public.kenya_trip_impact_logs FOR ALL
  USING (public.is_tpc_admin());

CREATE POLICY "Members can read all impact"
  ON public.kenya_trip_impact_logs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Members can create impact logs"
  ON public.kenya_trip_impact_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Members can delete own impact logs"
  ON public.kenya_trip_impact_logs FOR DELETE
  USING (
    participant_id IN (
      SELECT p.id FROM public.kenya_trip_participants p
      JOIN public.members m ON m.id = p.member_id
      WHERE m.user_id = auth.uid()
    )
  );

-- Reflections / testimony journal
CREATE TABLE IF NOT EXISTS public.kenya_trip_reflections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.kenya_trip_participants(id) ON DELETE CASCADE,
  reflection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  city VARCHAR(100),
  prompt TEXT,
  content TEXT NOT NULL,
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kenya_reflections_trip ON public.kenya_trip_reflections(trip_id);

ALTER TABLE public.kenya_trip_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access reflections"
  ON public.kenya_trip_reflections FOR ALL
  USING (public.is_tpc_admin());

CREATE POLICY "Members can read shared reflections"
  ON public.kenya_trip_reflections FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Members can create reflections"
  ON public.kenya_trip_reflections FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Members can update own reflections"
  ON public.kenya_trip_reflections FOR UPDATE
  USING (
    participant_id IN (
      SELECT p.id FROM public.kenya_trip_participants p
      JOIN public.members m ON m.id = p.member_id
      WHERE m.user_id = auth.uid()
    )
  );
