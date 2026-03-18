-- Fix: auth triggers fail with "Database error saving new user"
-- Root cause: SECURITY DEFINER functions lack explicit search_path,
-- so they cannot resolve public schema tables when triggered from auth schema.
-- Also adds ON CONFLICT handling for idempotent user creation.

create or replace function create_user_profile_on_signup()
returns trigger as $$
begin
  insert into public.user_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function create_token_wallet_on_signup()
returns trigger as $$
begin
  insert into public.token_wallets (user_id, balance_tokens)
  values (new.id, 1000)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Ensure triggers exist (idempotent)
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row
  execute function create_user_profile_on_signup();

drop trigger if exists on_auth_user_created_wallet on auth.users;
create trigger on_auth_user_created_wallet
  after insert on auth.users
  for each row
  execute function create_token_wallet_on_signup();
