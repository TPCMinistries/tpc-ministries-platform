-- RPC function to safely check if an email already has an auth account
-- Used by invite system to distinguish new vs existing users
create or replace function public.check_email_exists(check_email text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  return exists (
    select 1 from auth.users where email = lower(check_email)
  );
end;
$$;

-- Only allow service role to call this (prevents email enumeration from client)
revoke execute on function public.check_email_exists(text) from anon, authenticated;
grant execute on function public.check_email_exists(text) to service_role;
