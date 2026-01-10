-- Communication Enhancements Migration
-- SMS Campaigns, SMS Templates, Lead AI Scoring

-- ============================================
-- SMS CAMPAIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.sms_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  target_audience TEXT DEFAULT 'all', -- 'all', 'tier', 'subscribers', 'segment'
  target_tier TEXT, -- If target_audience = 'tier'
  target_segment_id UUID, -- For future segment support
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'failed'
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_status ON public.sms_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_scheduled ON public.sms_campaigns(scheduled_at) WHERE status = 'scheduled';

-- ============================================
-- SMS TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT DEFAULT 'general', -- 'welcome', 'reminder', 'announcement', 'follow-up', 'general'
  message TEXT NOT NULL,
  variables TEXT[], -- Supported variables like 'firstName', 'eventName'
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEAD SCORING FIELDS
-- ============================================
-- Add AI scoring fields to leads table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'ai_score') THEN
    ALTER TABLE public.leads ADD COLUMN ai_score INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'ai_priority') THEN
    ALTER TABLE public.leads ADD COLUMN ai_priority TEXT; -- 'hot', 'warm', 'cold'
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'ai_summary') THEN
    ALTER TABLE public.leads ADD COLUMN ai_summary TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'ai_scored_at') THEN
    ALTER TABLE public.leads ADD COLUMN ai_scored_at TIMESTAMPTZ;
  END IF;
END $$;

-- Index for AI scoring
CREATE INDEX IF NOT EXISTS idx_leads_ai_priority ON public.leads(ai_priority) WHERE ai_priority IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_ai_score ON public.leads(ai_score DESC) WHERE ai_score IS NOT NULL;

-- ============================================
-- AUTOMATION TRIGGERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.automation_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- 'event', 'schedule', 'condition'
  trigger_event TEXT, -- 'member_joined', 'lead_created', 'donation_received', 'streak_at_risk', etc.
  trigger_schedule TEXT, -- Cron expression for scheduled triggers
  trigger_conditions JSONB, -- Complex conditions
  actions JSONB NOT NULL, -- Array of actions to perform
  is_active BOOLEAN DEFAULT TRUE,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUTOMATION EXECUTION LOG
-- ============================================
CREATE TABLE IF NOT EXISTS public.automation_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_id UUID REFERENCES automation_triggers(id) ON DELETE CASCADE,
  trigger_event TEXT,
  target_entity_type TEXT,
  target_entity_id UUID,
  actions_executed JSONB,
  status TEXT DEFAULT 'success', -- 'success', 'partial', 'failed'
  error_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_executions_trigger ON public.automation_executions(trigger_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_date ON public.automation_executions(executed_at DESC);

-- ============================================
-- SMS SUBSCRIPTION FIELD
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'sms_subscribed') THEN
    ALTER TABLE public.members ADD COLUMN sms_subscribed BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- ============================================
-- INSERT DEFAULT SMS TEMPLATES
-- ============================================
INSERT INTO public.sms_templates (name, category, message, variables) VALUES
('Welcome Message', 'welcome', 'Welcome to TPC Ministries, {{firstName}}! We''re so glad you''re here. Reply STOP to opt out.', ARRAY['firstName']),
('Event Reminder', 'reminder', 'Hi {{firstName}}! Reminder: {{eventName}} is tomorrow at {{eventTime}}. See you there!', ARRAY['firstName', 'eventName', 'eventTime']),
('Prayer Request Follow-up', 'follow-up', 'Hi {{firstName}}, we''ve been praying for you. How are things going? Let us know if you need anything.', ARRAY['firstName']),
('Sunday Service Reminder', 'reminder', 'See you tomorrow at TPC! Service starts at 10am. Bring a friend!', ARRAY[]),
('New Content Alert', 'announcement', 'New teaching available: "{{teachingTitle}}" - Watch now at tpcministries.org/teachings', ARRAY['teachingTitle']),
('Birthday Greeting', 'general', 'Happy Birthday, {{firstName}}! The TPC family celebrates you today. Have a blessed year ahead!', ARRAY['firstName']),
('Streak Encouragement', 'reminder', 'Hey {{firstName}}! Your {{streakDays}}-day streak is at risk. Check in today to keep it going!', ARRAY['firstName', 'streakDays']),
('Giving Thank You', 'follow-up', 'Thank you for your generous gift, {{firstName}}. Your support makes a real difference in our ministry.', ARRAY['firstName'])
ON CONFLICT DO NOTHING;

-- ============================================
-- RLS POLICIES
-- ============================================

-- SMS Campaigns
ALTER TABLE public.sms_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/staff can manage SMS campaigns" ON public.sms_campaigns
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.user_id = auth.uid()
      AND members.role IN ('admin', 'staff')
    )
  );

-- SMS Templates
ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/staff can manage SMS templates" ON public.sms_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.user_id = auth.uid()
      AND members.role IN ('admin', 'staff')
    )
  );

-- Automation Triggers
ALTER TABLE public.automation_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage automations" ON public.automation_triggers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.user_id = auth.uid()
      AND members.role = 'admin'
    )
  );

-- Automation Executions
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/staff can view automation executions" ON public.automation_executions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.user_id = auth.uid()
      AND members.role IN ('admin', 'staff')
    )
  );
