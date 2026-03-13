-- Token wallet for each user
create table if not exists token_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance_tokens integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Token transaction log
create table if not exists token_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tokens_used integer not null,
  operation_type text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

-- AI request log with token usage breakdown
create table if not exists ai_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_tokens integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens integer not null default 0,
  request_type text not null,
  created_at timestamptz not null default now()
);

-- Auto-update updated_at on token_wallets
create or replace function update_token_wallet_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger token_wallets_updated_at
  before update on token_wallets
  for each row
  execute function update_token_wallet_timestamp();

-- Row Level Security
alter table token_wallets enable row level security;
alter table token_transactions enable row level security;
alter table ai_requests enable row level security;

-- Users can read their own wallet
create policy "Users can read own wallet"
  on token_wallets for select
  using (auth.uid() = user_id);

-- Users can read their own transactions
create policy "Users can read own transactions"
  on token_transactions for select
  using (auth.uid() = user_id);

-- Users can read their own AI requests
create policy "Users can read own ai_requests"
  on ai_requests for select
  using (auth.uid() = user_id);

-- Service role can manage all rows (Edge Functions use service role)
create policy "Service role manages wallets"
  on token_wallets for all
  using (auth.role() = 'service_role');

create policy "Service role manages transactions"
  on token_transactions for all
  using (auth.role() = 'service_role');

create policy "Service role manages ai_requests"
  on ai_requests for all
  using (auth.role() = 'service_role');

-- Auto-create wallet on user signup
create or replace function create_token_wallet_on_signup()
returns trigger as $$
begin
  insert into token_wallets (user_id, balance_tokens)
  values (new.id, 1000);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_wallet
  after insert on auth.users
  for each row
  execute function create_token_wallet_on_signup();
