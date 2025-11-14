# Admin Role Management - SQL Setup

Run these SQL commands in your Supabase SQL Editor to set up admin role management.

## Step 1: Add is_admin Column and Set Up Policies

```sql
-- ============================================
-- ADMIN ROLE MANAGEMENT SETUP
-- ============================================

-- Add is_admin column to members table
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS members_is_admin_idx ON public.members(is_admin);

-- Add comment
COMMENT ON COLUMN public.members.is_admin IS 'Indicates if the member has admin/leadership access to the admin portal';

-- ============================================
-- Update RLS policies for admin access
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
-- Create helper function to check if user is admin
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
```

## Step 2: Make Your Account an Admin

**IMPORTANT:** Replace `YOUR_EMAIL_HERE` with your actual email address.

```sql
-- Make yourself an admin
UPDATE public.members
SET is_admin = true,
    updated_at = NOW()
WHERE email = 'YOUR_EMAIL_HERE';

-- Verify it worked (should return 1 row with is_admin = true)
SELECT id, email, first_name, last_name, is_admin, tier
FROM public.members
WHERE email = 'YOUR_EMAIL_HERE';
```

## Step 3: Verify Setup

Run this query to see all admin users:

```sql
SELECT
  id,
  email,
  first_name,
  last_name,
  tier,
  is_admin,
  created_at
FROM public.members
WHERE is_admin = true
ORDER BY created_at DESC;
```

## What This Does

1. ✅ Adds `is_admin` column to track who has admin access
2. ✅ Creates index for fast admin queries
3. ✅ Updates RLS policies so admins can:
   - View all members
   - Update any member
   - Create new members
   - Manage admin access for others
4. ✅ Creates helper function `is_admin()` for easy permission checks
5. ✅ Makes your account an admin so you can access `/admin` routes

## Next Steps

After running this SQL:

1. Log out and log back in
2. Navigate to `/admin/dashboard` - you should have access
3. Go to `/admin/settings` to manage admin users
4. Grant admin access to other team members as needed

## Troubleshooting

### Still can't access /admin routes?
- Make sure you ran Step 2 with YOUR email
- Verify with the query in Step 3 that is_admin = true
- Log out and log back in
- Clear your browser cache

### Getting permission errors?
- Check that all RLS policies were created successfully
- Run: `SELECT * FROM pg_policies WHERE tablename = 'members';`
- You should see 3 policies with "Admins" in the name

### Need to remove admin access?
```sql
UPDATE public.members
SET is_admin = false
WHERE email = 'user@example.com';
```

### Need to add another admin manually?
```sql
UPDATE public.members
SET is_admin = true
WHERE email = 'newadmin@example.com';
```

## Admin Permissions

Admin users can:
- ✅ Access the admin dashboard at `/admin`
- ✅ Manage all content (teachings, prophecies, events, resources)
- ✅ View and manage all members
- ✅ Assign personal prophecies to members
- ✅ Send emails and SMS to members
- ✅ View all donations and giving history
- ✅ Manage prayer requests
- ✅ Upload and manage media files
- ✅ Grant or revoke admin access to other users
- ✅ Access analytics and reports

Regular members (is_admin = false) can only:
- Access member portal at `/member`
- View their own data
- Update their own profile
- No access to `/admin` routes
