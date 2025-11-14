-- ============================================
-- ADMIN ROLE MANAGEMENT SETUP
-- ============================================

-- STEP 1: Add is_admin column to members table
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS members_is_admin_idx ON public.members(is_admin);

-- Add comment
COMMENT ON COLUMN public.members.is_admin IS 'Indicates if the member has admin/leadership access to the admin portal';

-- ============================================
-- STEP 2: Update RLS policies for admin access
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all members" ON public.members;
DROP POLICY IF EXISTS "Admins can update any member" ON public.members;
DROP POLICY IF EXISTS "Admins can insert members" ON public.members;

-- Policy: Admins can view all members
CREATE POLICY "Admins can view all members"
ON public.members
FOR SELECT
USING (
  -- Admins can see everyone, regular users can see themselves
  EXISTS (
    SELECT 1 FROM public.members
    WHERE members.user_id = auth.uid()
    AND members.is_admin = true
  )
  OR user_id = auth.uid()
);

-- Policy: Admins can update any member
CREATE POLICY "Admins can update any member"
ON public.members
FOR UPDATE
USING (
  -- Only admins can update members
  EXISTS (
    SELECT 1 FROM public.members
    WHERE members.user_id = auth.uid()
    AND members.is_admin = true
  )
  OR user_id = auth.uid() -- Users can update themselves
);

-- Policy: Admins can insert members
CREATE POLICY "Admins can insert members"
ON public.members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.members
    WHERE members.user_id = auth.uid()
    AND members.is_admin = true
  )
);

-- ============================================
-- STEP 3: Create function to check if user is admin
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.members
    WHERE user_id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION is_admin() IS 'Helper function to check if current user is an admin';

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this after the migration to verify:
-- SELECT email, first_name, last_name, is_admin FROM public.members WHERE is_admin = true;
