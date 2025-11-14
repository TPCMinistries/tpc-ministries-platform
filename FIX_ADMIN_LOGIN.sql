-- ============================================
-- FIX ADMIN LOGIN ISSUE
-- ============================================
-- Run this in Supabase SQL Editor
-- This will create/fix member records for your admin accounts
-- ============================================

-- Step 1: Check if member records exist
SELECT
  auth.users.email,
  auth.users.id as user_id,
  members.id as member_id,
  members.is_admin,
  members.created_at
FROM auth.users
LEFT JOIN public.members ON members.user_id = auth.users.id
WHERE auth.users.email IN (
  'lorenzo@theglobalenterprise.org',
  'lorenzo.d.chambers@gmail.com',
  'sarahdaughtrychambers@gmail.com'
)
ORDER BY auth.users.email;

-- ============================================
-- Step 2: If any accounts show NULL member_id, run this:
-- ============================================

-- Create member records for accounts that don't have them
INSERT INTO public.members (
  user_id,
  email,
  first_name,
  last_name,
  tier,
  is_admin,
  created_at,
  updated_at
)
SELECT
  auth.users.id as user_id,
  auth.users.email,
  COALESCE(
    SPLIT_PART(auth.users.raw_user_meta_data->>'full_name', ' ', 1),
    SPLIT_PART(auth.users.email, '@', 1)
  ) as first_name,
  COALESCE(
    SPLIT_PART(auth.users.raw_user_meta_data->>'full_name', ' ', 2),
    ''
  ) as last_name,
  'free' as tier,
  true as is_admin,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users
WHERE auth.users.email IN (
  'lorenzo@theglobalenterprise.org',
  'lorenzo.d.chambers@gmail.com',
  'sarahdaughtrychambers@gmail.com'
)
AND NOT EXISTS (
  SELECT 1 FROM public.members
  WHERE members.user_id = auth.users.id
)
ON CONFLICT (user_id) DO UPDATE
SET
  is_admin = true,
  updated_at = NOW();

-- ============================================
-- Step 3: Verify member records were created
-- ============================================

SELECT
  members.email,
  members.first_name,
  members.last_name,
  members.tier,
  members.is_admin,
  members.user_id,
  members.created_at
FROM public.members
WHERE members.email IN (
  'lorenzo@theglobalenterprise.org',
  'lorenzo.d.chambers@gmail.com',
  'sarahdaughtrychambers@gmail.com'
)
ORDER BY members.email;

-- ============================================
-- Expected Result:
-- You should see 3 rows with:
-- - is_admin = true
-- - valid first_name and last_name
-- - tier = 'free'
-- ============================================
