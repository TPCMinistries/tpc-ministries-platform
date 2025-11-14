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
