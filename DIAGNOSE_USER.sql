-- ============================================
-- DIAGNOSTIC: Check user and member status
-- ============================================
-- Run this to see what's actually in the database
-- ============================================

-- Step 1: Check if auth users exist with these emails
SELECT
  'AUTH USER' as record_type,
  id::text as user_id,
  email,
  created_at::text,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
WHERE email IN (
  'lorenzo@theglobalenterprise.org',
  'lorenzo.d.chambers@gmail.com',
  'sarahdaughtrychambers@gmail.com'
)

UNION ALL

-- Step 2: Check if member records exist
SELECT
  'MEMBER RECORD' as record_type,
  m.user_id::text,
  u.email,
  m.created_at::text,
  m.first_name || ' ' || m.last_name as full_name
FROM public.members m
JOIN auth.users u ON m.user_id = u.id
WHERE u.email IN (
  'lorenzo@theglobalenterprise.org',
  'lorenzo.d.chambers@gmail.com',
  'sarahdaughtrychambers@gmail.com'
)

ORDER BY record_type, email;

-- ============================================
-- This will show you:
-- 1. If the auth users exist
-- 2. If member records exist for them
-- 3. What email you're ACTUALLY using to login
-- ============================================
