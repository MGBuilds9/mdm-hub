-- Create user profile for Michael Guirguis
-- Run this in your Supabase SQL Editor

-- First, let's find your Supabase user ID
-- Replace 'michael.guirguis@mdmgroupinc.ca' with your actual email
SELECT id, email FROM auth.users WHERE email = 'michael.guirguis@mdmgroupinc.ca';

-- Then create the user profile (replace the supabase_user_id with the ID from above)
INSERT INTO users (
  email,
  first_name,
  last_name,
  supabase_user_id,
  is_internal,
  is_active,
  created_at,
  updated_at
) VALUES (
  'michael.guirguis@mdmgroupinc.ca',
  'Michael',
  'Guirguis',
  'YOUR_SUPABASE_USER_ID_HERE', -- Replace with actual ID from query above
  true,
  true,
  NOW(),
  NOW()
);

-- Assign user to a division (replace division_id with actual division ID)
-- You can check available divisions with: SELECT * FROM divisions;
INSERT INTO user_divisions (user_id, division_id, role, created_at, updated_at)
SELECT 
  u.id,
  d.id,
  'admin',
  NOW(),
  NOW()
FROM users u, divisions d
WHERE u.email = 'michael.guirguis@mdmgroupinc.ca'
AND d.name = 'Group'; -- or whichever division you want to assign

-- Verify the user was created
SELECT 
  u.*,
  ud.role,
  d.name as division_name
FROM users u
LEFT JOIN user_divisions ud ON u.id = ud.user_id
LEFT JOIN divisions d ON ud.division_id = d.id
WHERE u.email = 'michael.guirguis@mdmgroupinc.ca';
