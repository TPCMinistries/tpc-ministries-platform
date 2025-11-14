-- ============================================
-- FIX MEMBER SIGNUP ISSUE
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- PART 1: Create trigger for future signups
-- ============================================

-- Create a function to automatically create a member record when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  name_parts TEXT[];
  first_name_val TEXT;
  last_name_val TEXT;
BEGIN
  -- Split the full_name from auth metadata into first and last name
  IF NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
    name_parts := string_to_array(NEW.raw_user_meta_data->>'full_name', ' ');
    first_name_val := name_parts[1];
    -- Join remaining parts as last name
    IF array_length(name_parts, 1) > 1 THEN
      last_name_val := array_to_string(name_parts[2:array_length(name_parts,1)], ' ');
    ELSE
      last_name_val := '';
    END IF;
  ELSE
    first_name_val := '';
    last_name_val := '';
  END IF;

  -- Insert new member record
  INSERT INTO public.members (
    user_id,
    email,
    first_name,
    last_name,
    tier,
    is_admin,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    first_name_val,
    last_name_val,
    'free',
    false,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PART 2: Create member records for existing auth users
-- ============================================

-- This will create member records for any auth users that don't have a member record yet
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
  au.id as user_id,
  au.email,
  COALESCE(
    split_part(au.raw_user_meta_data->>'full_name', ' ', 1),
    ''
  ) as first_name,
  COALESCE(
    CASE
      WHEN array_length(string_to_array(au.raw_user_meta_data->>'full_name', ' '), 1) > 1
      THEN array_to_string(
        (string_to_array(au.raw_user_meta_data->>'full_name', ' '))[2:array_length(string_to_array(au.raw_user_meta_data->>'full_name', ' '), 1)],
        ' '
      )
      ELSE ''
    END,
    ''
  ) as last_name,
  'free' as tier,
  false as is_admin,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.members m ON m.user_id = au.id
WHERE m.user_id IS NULL;

-- ============================================
-- PART 3: Verify the fix worked
-- ============================================

-- Check all users and their member records
SELECT
  au.email as auth_email,
  au.raw_user_meta_data->>'full_name' as full_name_from_auth,
  m.email as member_email,
  m.first_name,
  m.last_name,
  m.tier,
  m.is_admin,
  CASE WHEN m.user_id IS NOT NULL THEN 'YES' ELSE 'NO' END as has_member_record
FROM auth.users au
LEFT JOIN public.members m ON m.user_id = au.id
ORDER BY au.created_at DESC;

-- ============================================
-- Expected Result:
-- All users should show has_member_record = 'YES'
-- ============================================
