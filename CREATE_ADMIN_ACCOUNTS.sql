-- ============================================
-- CREATE ADMIN ACCOUNTS FOR TPC MINISTRIES
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- IMPORTANT: First, these users must sign up on the website at:
-- https://tpcmin.org/auth/signup
--
-- Use these details when signing up:
--
-- Account 1:
--   Email: lorenzo@theglobalenterprise.org
--   First Name: Lorenzo
--   Last Name: Daughtry-Chambers
--   Password: [choose a strong password]
--
-- Account 2:
--   Email: lorenzo.d.chambers@gmail.com
--   First Name: Lorenzo
--   Last Name: Daughtry-Chambers
--   Password: [choose a strong password]
--
-- Account 3:
--   Email: sarahdaughtrychambers@gmail.com
--   First Name: Sarah
--   Last Name: Daughtry-Chambers
--   Password: [choose a strong password]
--
-- AFTER signing up, run the SQL below to grant admin access:

-- ============================================
-- GRANT ADMIN ACCESS
-- ============================================

-- Make lorenzo@theglobalenterprise.org an admin
UPDATE public.members
SET is_admin = true
WHERE email = 'lorenzo@theglobalenterprise.org';

-- Make lorenzo.d.chambers@gmail.com an admin
UPDATE public.members
SET is_admin = true
WHERE email = 'lorenzo.d.chambers@gmail.com';

-- Make sarahdaughtrychambers@gmail.com an admin
UPDATE public.members
SET is_admin = true
WHERE email = 'sarahdaughtrychambers@gmail.com';

-- ============================================
-- VERIFICATION - Check if accounts are admin
-- ============================================

SELECT
  email,
  first_name,
  last_name,
  tier,
  is_admin,
  created_at
FROM public.members
WHERE email IN (
  'lorenzo@theglobalenterprise.org',
  'lorenzo.d.chambers@gmail.com',
  'sarahdaughtrychambers@gmail.com'
)
ORDER BY email;

-- ============================================
-- Expected Result:
-- You should see 3 rows with is_admin = true
-- ============================================
