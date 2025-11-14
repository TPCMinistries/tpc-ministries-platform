-- Check if lorenzo.d.chambers@gmail.com is marked as admin
SELECT
  m.id,
  m.user_id,
  m.first_name,
  m.last_name,
  m.is_admin,
  m.is_active,
  u.email
FROM public.members m
JOIN auth.users u ON m.user_id = u.id
WHERE u.email = 'lorenzo.d.chambers@gmail.com';
