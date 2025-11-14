-- ============================================
-- LEAD MANAGEMENT SYSTEM FOR TPC MINISTRIES
-- ============================================

-- Drop table if exists (for clean setup)
DROP TABLE IF EXISTS public.leads CASCADE;

-- Create leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  source TEXT DEFAULT 'website' CHECK (source IN ('website', 'event', 'referral', 'social_media', 'other')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'nurturing', 'converted', 'inactive')),
  interest_level TEXT DEFAULT 'warm' CHECK (interest_level IN ('cold', 'warm', 'hot')),
  interests TEXT[], -- Array like: ['teachings', 'prayer', 'giving', 'events', 'prophecy', 'missions']
  notes TEXT,
  assigned_to UUID REFERENCES public.members(id),
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  converted_to_member_id UUID REFERENCES public.members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better query performance
CREATE INDEX leads_email_idx ON public.leads(email);
CREATE INDEX leads_status_idx ON public.leads(status);
CREATE INDEX leads_interest_level_idx ON public.leads(interest_level);
CREATE INDEX leads_created_at_idx ON public.leads(created_at DESC);
CREATE INDEX leads_source_idx ON public.leads(source);
CREATE INDEX leads_assigned_to_idx ON public.leads(assigned_to);

-- Add comments for documentation
COMMENT ON TABLE public.leads IS 'Stores potential members (leads) before they convert to full members';
COMMENT ON COLUMN public.leads.source IS 'Where the lead came from: website, event, referral, social_media, other';
COMMENT ON COLUMN public.leads.status IS 'Current status in the lead nurturing pipeline';
COMMENT ON COLUMN public.leads.interest_level IS 'How engaged/interested the lead is: cold, warm, hot';
COMMENT ON COLUMN public.leads.interests IS 'Array of topics the lead is interested in';
COMMENT ON COLUMN public.leads.assigned_to IS 'Which admin/staff member is responsible for following up';
COMMENT ON COLUMN public.leads.converted_to_member_id IS 'Set when lead becomes a member, links to members table';

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage leads
DROP POLICY IF EXISTS "Admins can manage leads" ON public.leads;
CREATE POLICY "Admins can manage leads" ON public.leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE members.user_id = auth.uid()
      AND members.is_admin = true
    )
  );

-- Policy to allow public inserts (for homepage form)
DROP POLICY IF EXISTS "Public can create leads" ON public.leads;
CREATE POLICY "Public can create leads" ON public.leads
  FOR INSERT
  WITH CHECK (true);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_updated_at ON public.leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- Create activity log table for lead timeline
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'created', 'status_changed', 'note_added', 'contacted', 'converted', etc.
  description TEXT NOT NULL,
  performed_by UUID REFERENCES public.members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX lead_activities_lead_id_idx ON public.lead_activities(lead_id);
CREATE INDEX lead_activities_created_at_idx ON public.lead_activities(created_at DESC);

-- Enable RLS on activities
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage lead activities" ON public.lead_activities;
CREATE POLICY "Admins can manage lead activities" ON public.lead_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE members.user_id = auth.uid()
      AND members.is_admin = true
    )
  );

-- Function to create activity log entry
CREATE OR REPLACE FUNCTION log_lead_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.lead_activities (lead_id, activity_type, description)
    VALUES (NEW.id, 'created', 'Lead created from ' || NEW.source);
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.status != NEW.status) THEN
      INSERT INTO public.lead_activities (lead_id, activity_type, description)
      VALUES (NEW.id, 'status_changed', 'Status changed from ' || OLD.status || ' to ' || NEW.status);
    END IF;
    IF (OLD.interest_level != NEW.interest_level) THEN
      INSERT INTO public.lead_activities (lead_id, activity_type, description)
      VALUES (NEW.id, 'interest_level_changed', 'Interest level changed from ' || OLD.interest_level || ' to ' || NEW.interest_level);
    END IF;
    IF (NEW.last_contacted_at IS NOT NULL AND (OLD.last_contacted_at IS NULL OR OLD.last_contacted_at != NEW.last_contacted_at)) THEN
      INSERT INTO public.lead_activities (lead_id, activity_type, description)
      VALUES (NEW.id, 'contacted', 'Lead was contacted');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_lead_activity_trigger ON public.leads;
CREATE TRIGGER log_lead_activity_trigger
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION log_lead_activity();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Leads table and activity tracking created successfully!';
END $$;
