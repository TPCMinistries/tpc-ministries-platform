-- TPC Ministries - 5-Tier Role System Migration
-- Roles: admin, staff, partner, member, free

-- Step 1: Add role column to members table
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'free';

-- Step 2: Add constraint for valid role values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'members_role_check'
  ) THEN
    ALTER TABLE public.members
    ADD CONSTRAINT members_role_check
    CHECK (role IN ('admin', 'staff', 'partner', 'member', 'free'));
  END IF;
END $$;

-- Step 3: Create index for performance
CREATE INDEX IF NOT EXISTS members_role_idx ON public.members(role);

-- Step 4: Migrate existing data
-- Convert existing admins to role='admin'
UPDATE public.members
SET role = 'admin'
WHERE is_admin = true AND (role IS NULL OR role = 'free');

-- Convert existing partner tier to role='partner'
UPDATE public.members
SET role = 'partner'
WHERE tier = 'partner' AND role = 'free' AND is_admin = false;

-- Convert existing covenant tier to role='partner' (covenant is premium partner)
UPDATE public.members
SET role = 'partner'
WHERE tier = 'covenant' AND role = 'free' AND is_admin = false;

-- Step 5: Add login tracking columns for engagement metrics
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Step 6: Add role upgrade tracking
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS role_updated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS role_upgrade_reason TEXT;

-- Step 7: Create role history table for audit trail
CREATE TABLE IF NOT EXISTS public.member_role_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  previous_role VARCHAR(20),
  new_role VARCHAR(20) NOT NULL,
  changed_by UUID REFERENCES public.members(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS member_role_history_member_idx
ON public.member_role_history(member_id);

CREATE INDEX IF NOT EXISTS member_role_history_created_idx
ON public.member_role_history(created_at DESC);

-- Step 8: Create function to check role hierarchy
CREATE OR REPLACE FUNCTION has_minimum_role(user_role VARCHAR, required_role VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  role_levels JSONB := '{"free": 0, "member": 1, "partner": 2, "staff": 3, "admin": 4}'::JSONB;
  user_level INTEGER;
  required_level INTEGER;
BEGIN
  user_level := COALESCE((role_levels ->> user_role)::INTEGER, 0);
  required_level := COALESCE((role_levels ->> required_role)::INTEGER, 0);
  RETURN user_level >= required_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 9: Create function to check if current user has minimum role
CREATE OR REPLACE FUNCTION current_user_has_role(required_role VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT role INTO user_role
  FROM public.members
  WHERE user_id = auth.uid();

  RETURN has_minimum_role(COALESCE(user_role, 'free'), required_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Update RLS policies for role-based access

-- Drop existing admin-only policies if they exist
DROP POLICY IF EXISTS "Admins can view all members" ON public.members;
DROP POLICY IF EXISTS "Admins can update any member" ON public.members;

-- Create new role-based policies
CREATE POLICY "Staff and above can view all members"
ON public.members FOR SELECT
USING (
  current_user_has_role('staff') OR user_id = auth.uid()
);

CREATE POLICY "Staff and above can update members"
ON public.members FOR UPDATE
USING (
  current_user_has_role('staff') OR user_id = auth.uid()
);

-- Only admins can change roles (not staff)
CREATE POLICY "Only admins can change member roles"
ON public.members FOR UPDATE
USING (
  current_user_has_role('admin')
)
WITH CHECK (
  current_user_has_role('admin')
);

-- Enable RLS on role history table
ALTER TABLE public.member_role_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view role history"
ON public.member_role_history FOR SELECT
USING (current_user_has_role('staff'));

CREATE POLICY "Admins can insert role history"
ON public.member_role_history FOR INSERT
WITH CHECK (current_user_has_role('admin'));

-- Step 11: Add comment for documentation
COMMENT ON COLUMN public.members.role IS 'Member role in hierarchy: free < member < partner < staff < admin';
COMMENT ON TABLE public.member_role_history IS 'Audit trail for member role changes';

-- Step 12: Create trigger to auto-log role changes
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.member_role_history (
      member_id,
      previous_role,
      new_role,
      changed_by,
      reason
    )
    VALUES (
      NEW.id,
      OLD.role,
      NEW.role,
      (SELECT id FROM public.members WHERE user_id = auth.uid()),
      NEW.role_upgrade_reason
    );

    -- Update role_updated_at timestamp
    NEW.role_updated_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_role_change ON public.members;
CREATE TRIGGER trigger_log_role_change
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION log_role_change();
