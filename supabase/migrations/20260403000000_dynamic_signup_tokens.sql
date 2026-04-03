-- Update the signup trigger to read free_tokens_on_signup from admin_settings
-- instead of using a hardcoded value of 1000.
-- Also remove unused free trial fields from admin_settings.

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
  from admin_settings
  where key = 'free_benefits';

  -- Fallback if no admin_settings row exists
  if signup_tokens is null then
    signup_tokens := 1000;
  end if;

  insert into token_wallets (user_id, balance_tokens)
  values (new.id, signup_tokens);

  return new;
end;
$$ language plpgsql security definer;

-- Clean up free trial fields from admin_settings free_benefits config.
-- Keep only free_tokens_on_signup.
update admin_settings
set value = jsonb_build_object(
  'free_tokens_on_signup', coalesce((value->>'free_tokens_on_signup')::int, 1000)
)
where key = 'free_benefits';
