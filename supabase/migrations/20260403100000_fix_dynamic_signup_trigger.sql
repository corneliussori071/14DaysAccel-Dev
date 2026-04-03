-- Fix: restore search_path and ON CONFLICT that were dropped
-- in 20260403000000_dynamic_signup_tokens.sql

create or replace function create_token_wallet_on_signup()
returns trigger as $$
declare
  signup_tokens int;
begin
  -- Read configured signup tokens from admin_settings
  select coalesce(
    (value->>'free_tokens_on_signup')::int,
    1000
  ) into signup_tokens
  from public.admin_settings
  where key = 'free_benefits';

  -- Fallback if no admin_settings row exists
  if signup_tokens is null then
    signup_tokens := 1000;
  end if;

  insert into public.token_wallets (user_id, balance_tokens)
  values (new.id, signup_tokens)
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;
