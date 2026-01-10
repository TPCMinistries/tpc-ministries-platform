-- TPC Ministries - Admin Enhancements Migration
-- Adds: Granular Permissions, Audit Log, Admin Tasks, Event Check-in, Volunteer Hours

-- ============================================
-- PART 1: GRANULAR PERMISSIONS SYSTEM
-- ============================================

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role VARCHAR(20) NOT NULL,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- Create member_permissions for individual overrides
CREATE TABLE IF NOT EXISTS public.member_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT TRUE,
  granted_by UUID REFERENCES public.members(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, permission_id)
);

-- Insert default permissions
INSERT INTO public.permissions (name, description, category) VALUES
  -- Member Management
  ('members.view', 'View member list and profiles', 'members'),
  ('members.edit', 'Edit member information', 'members'),
  ('members.delete', 'Delete members', 'members'),
  ('members.import', 'Import members from CSV', 'members'),
  ('members.export', 'Export member data', 'members'),
  ('members.roles', 'Change member roles', 'members'),

  -- Content Management
  ('content.view', 'View all content', 'content'),
  ('content.create', 'Create new content', 'content'),
  ('content.edit', 'Edit existing content', 'content'),
  ('content.delete', 'Delete content', 'content'),
  ('content.publish', 'Publish/unpublish content', 'content'),

  -- Events Management
  ('events.view', 'View all events', 'events'),
  ('events.create', 'Create events', 'events'),
  ('events.edit', 'Edit events', 'events'),
  ('events.delete', 'Delete events', 'events'),
  ('events.checkin', 'Check in attendees', 'events'),

  -- Giving/Finance
  ('giving.view', 'View giving records', 'giving'),
  ('giving.create', 'Record donations', 'giving'),
  ('giving.edit', 'Edit donation records', 'giving'),
  ('giving.reports', 'View financial reports', 'giving'),
  ('giving.export', 'Export financial data', 'giving'),

  -- Communications
  ('communications.view', 'View messages', 'communications'),
  ('communications.send', 'Send messages/emails', 'communications'),
  ('communications.campaigns', 'Manage email campaigns', 'communications'),

  -- Groups
  ('groups.view', 'View all groups', 'groups'),
  ('groups.create', 'Create groups', 'groups'),
  ('groups.edit', 'Edit groups', 'groups'),
  ('groups.delete', 'Delete groups', 'groups'),
  ('groups.manage_members', 'Manage group membership', 'groups'),

  -- Volunteers
  ('volunteers.view', 'View volunteer records', 'volunteers'),
  ('volunteers.manage', 'Manage volunteer assignments', 'volunteers'),
  ('volunteers.hours', 'Track volunteer hours', 'volunteers'),

  -- Prayer
  ('prayer.view', 'View all prayer requests', 'prayer'),
  ('prayer.manage', 'Manage prayer requests', 'prayer'),

  -- Settings
  ('settings.view', 'View admin settings', 'settings'),
  ('settings.edit', 'Edit admin settings', 'settings'),
  ('settings.permissions', 'Manage permissions', 'settings'),

  -- Analytics
  ('analytics.view', 'View analytics dashboard', 'analytics'),
  ('analytics.reports', 'Generate reports', 'analytics'),
  ('analytics.export', 'Export analytics data', 'analytics')
ON CONFLICT (name) DO NOTHING;

-- Assign default permissions to roles
-- Admin gets everything
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions
ON CONFLICT DO NOTHING;

-- Staff gets most things except sensitive settings
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'staff', id FROM public.permissions
WHERE name NOT IN ('members.delete', 'members.roles', 'settings.permissions', 'giving.export')
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS role_permissions_role_idx ON public.role_permissions(role);
CREATE INDEX IF NOT EXISTS member_permissions_member_idx ON public.member_permissions(member_id);

-- ============================================
-- PART 2: ADMIN AUDIT LOG
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.members(id),
  admin_name VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  entity_name VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_log_admin_idx ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS audit_log_action_idx ON public.admin_audit_log(action);
CREATE INDEX IF NOT EXISTS audit_log_entity_idx ON public.admin_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_log_created_idx ON public.admin_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view audit log"
ON public.admin_audit_log FOR SELECT
USING (current_user_has_role('staff'));

CREATE POLICY "System can insert audit log"
ON public.admin_audit_log FOR INSERT
WITH CHECK (true);

-- ============================================
-- PART 3: ADMIN TASKS SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date DATE,
  assigned_to UUID REFERENCES public.members(id),
  assigned_by UUID REFERENCES public.members(id),
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES public.members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_tasks_assigned_idx ON public.admin_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS admin_tasks_status_idx ON public.admin_tasks(status);
CREATE INDEX IF NOT EXISTS admin_tasks_due_idx ON public.admin_tasks(due_date);

-- Enable RLS
ALTER TABLE public.admin_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all tasks"
ON public.admin_tasks FOR SELECT
USING (current_user_has_role('staff'));

CREATE POLICY "Staff can create tasks"
ON public.admin_tasks FOR INSERT
WITH CHECK (current_user_has_role('staff'));

CREATE POLICY "Staff can update tasks"
ON public.admin_tasks FOR UPDATE
USING (current_user_has_role('staff'));

-- ============================================
-- PART 4: EVENT CHECK-IN SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.event_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id),
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),
  guest_phone VARCHAR(50),
  checked_in_by UUID REFERENCES public.members(id),
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  check_in_method VARCHAR(20) DEFAULT 'manual' CHECK (check_in_method IN ('manual', 'qr_code', 'self')),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS event_checkins_event_idx ON public.event_checkins(event_id);
CREATE INDEX IF NOT EXISTS event_checkins_member_idx ON public.event_checkins(member_id);
CREATE UNIQUE INDEX IF NOT EXISTS event_checkins_unique_idx ON public.event_checkins(event_id, member_id) WHERE member_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.event_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view checkins"
ON public.event_checkins FOR SELECT
USING (current_user_has_role('staff'));

CREATE POLICY "Staff can create checkins"
ON public.event_checkins FOR INSERT
WITH CHECK (current_user_has_role('staff'));

-- ============================================
-- PART 5: VOLUNTEER HOUR TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS public.volunteer_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.volunteer_opportunities(id),
  event_id UUID REFERENCES public.events(id),
  date DATE NOT NULL,
  hours_worked DECIMAL(4,2) NOT NULL CHECK (hours_worked > 0),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES public.members(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS volunteer_hours_member_idx ON public.volunteer_hours(member_id);
CREATE INDEX IF NOT EXISTS volunteer_hours_date_idx ON public.volunteer_hours(date);
CREATE INDEX IF NOT EXISTS volunteer_hours_status_idx ON public.volunteer_hours(status);

-- Enable RLS
ALTER TABLE public.volunteer_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own hours"
ON public.volunteer_hours FOR SELECT
USING (member_id = (SELECT id FROM public.members WHERE user_id = auth.uid()) OR current_user_has_role('staff'));

CREATE POLICY "Members can log own hours"
ON public.volunteer_hours FOR INSERT
WITH CHECK (member_id = (SELECT id FROM public.members WHERE user_id = auth.uid()) OR current_user_has_role('staff'));

CREATE POLICY "Staff can update hours"
ON public.volunteer_hours FOR UPDATE
USING (current_user_has_role('staff'));

-- Create view for volunteer hour summaries
CREATE OR REPLACE VIEW public.volunteer_hour_summary AS
SELECT
  m.id as member_id,
  m.first_name,
  m.last_name,
  m.email,
  COUNT(vh.id) as total_entries,
  COALESCE(SUM(CASE WHEN vh.status = 'approved' THEN vh.hours_worked ELSE 0 END), 0) as approved_hours,
  COALESCE(SUM(CASE WHEN vh.status = 'pending' THEN vh.hours_worked ELSE 0 END), 0) as pending_hours,
  MIN(vh.date) as first_volunteer_date,
  MAX(vh.date) as last_volunteer_date
FROM public.members m
LEFT JOIN public.volunteer_hours vh ON m.id = vh.member_id
GROUP BY m.id, m.first_name, m.last_name, m.email;

-- ============================================
-- PART 6: HELPER FUNCTION FOR PERMISSION CHECK
-- ============================================

CREATE OR REPLACE FUNCTION check_permission(permission_name VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  member_id UUID;
  member_role VARCHAR;
  has_permission BOOLEAN;
BEGIN
  -- Get current member
  SELECT id, role INTO member_id, member_role
  FROM public.members
  WHERE user_id = auth.uid();

  IF member_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check for individual override first
  SELECT granted INTO has_permission
  FROM public.member_permissions mp
  JOIN public.permissions p ON mp.permission_id = p.id
  WHERE mp.member_id = member_id AND p.name = permission_name;

  IF has_permission IS NOT NULL THEN
    RETURN has_permission;
  END IF;

  -- Check role-based permission
  SELECT EXISTS(
    SELECT 1 FROM public.role_permissions rp
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE rp.role = member_role AND p.name = permission_name
  ) INTO has_permission;

  RETURN COALESCE(has_permission, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE public.permissions IS 'Granular permission definitions';
COMMENT ON TABLE public.role_permissions IS 'Permissions assigned to roles by default';
COMMENT ON TABLE public.member_permissions IS 'Individual permission overrides for members';
COMMENT ON TABLE public.admin_audit_log IS 'Audit trail for all admin actions';
COMMENT ON TABLE public.admin_tasks IS 'Task management for admin team';
COMMENT ON TABLE public.event_checkins IS 'Event attendance tracking';
COMMENT ON TABLE public.volunteer_hours IS 'Volunteer service hour tracking';
