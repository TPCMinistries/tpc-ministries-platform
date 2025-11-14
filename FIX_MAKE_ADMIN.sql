-- Make lorenzo.d.chambers@gmail.com an admin
UPDATE public.members
SET
  is_admin = true,
  updated_at = NOW()
FROM auth.users
WHERE members.user_id = auth.users.id
AND auth.users.email = 'lorenzo.d.chambers@gmail.com';

-- Verify it worked
SELECT
  m.first_name,
  m.last_name,
  m.is_admin,
  u.email
FROM public.members m
JOIN auth.users u ON m.user_id = u.id
WHERE u.email = 'lorenzo.d.chambers@gmail.com';
