-- ============================================
-- 048: Kenya Community Feed + Social Handles
-- Delegate directory, trip feed, social integration
-- ============================================

-- Add social handle fields to participants
ALTER TABLE public.kenya_trip_participants
  ADD COLUMN IF NOT EXISTS instagram_handle VARCHAR(100),
  ADD COLUMN IF NOT EXISTS tiktok_handle VARCHAR(100),
  ADD COLUMN IF NOT EXISTS twitter_handle VARCHAR(100);

-- Create trip feed table
CREATE TABLE IF NOT EXISTS public.kenya_trip_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.kenya_trips(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.kenya_trip_participants(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kenya_feed_trip ON public.kenya_trip_feed(trip_id);
CREATE INDEX IF NOT EXISTS idx_kenya_feed_created ON public.kenya_trip_feed(created_at DESC);

-- RLS — authenticated users can read all feed posts for the trip, write their own
ALTER TABLE public.kenya_trip_feed ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access feed"
  ON public.kenya_trip_feed FOR ALL
  USING (public.is_tpc_admin());

-- Members can read all posts
CREATE POLICY "Members can read feed"
  ON public.kenya_trip_feed FOR SELECT
  USING (auth.role() = 'authenticated');

-- Members can insert their own posts
CREATE POLICY "Members can create feed posts"
  ON public.kenya_trip_feed FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Members can delete their own posts
CREATE POLICY "Members can delete own feed posts"
  ON public.kenya_trip_feed FOR DELETE
  USING (
    participant_id IN (
      SELECT id FROM public.kenya_trip_participants
      WHERE member_id = (SELECT id::text FROM auth.users WHERE id = auth.uid())
    )
  );
