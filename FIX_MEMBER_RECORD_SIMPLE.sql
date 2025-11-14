-- ============================================
-- STEP 1: Check what columns exist in members table
-- ============================================
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'members'
ORDER BY ordinal_position;

-- ============================================
-- STEP 2: Check your auth user info
-- ============================================
SELECT
  id,
  email,
  raw_user_meta_data,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- STEP 3: Check if member record exists
-- ============================================
SELECT * FROM public.members
ORDER BY created_at DESC
LIMIT 5;
