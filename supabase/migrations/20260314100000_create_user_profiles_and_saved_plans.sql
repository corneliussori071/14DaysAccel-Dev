-- User profiles for additional personal information
create table if not exists user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone_number text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security
alter table user_profiles enable row level security;

-- Users can read and update their own profile
create policy "Users can read own profile"
  on user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid() = user_id);

-- Service role can manage all profiles
create policy "Service role manages profiles"
  on user_profiles for all
  using (auth.role() = 'service_role');

-- Auto-update updated_at
create or replace function update_user_profile_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_profiles_updated_at
  before update on user_profiles
  for each row
  execute function update_user_profile_timestamp();

-- Auto-create profile on user signup
create or replace function create_user_profile_on_signup()
returns trigger as $$
begin
  insert into user_profiles (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row
  execute function create_user_profile_on_signup();

-- Saved plans for plan history
create table if not exists saved_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  goal_type text not null,
  model_id text not null default 'gpt-5.3-codex',
  plan_data jsonb not null default '{}',
  tokens_used integer not null default 0,
  billed_tokens integer not null default 0,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table saved_plans enable row level security;

-- Users can read and delete their own saved plans
create policy "Users can read own plans"
  on saved_plans for select
  using (auth.uid() = user_id);

create policy "Users can insert own plans"
  on saved_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own plans"
  on saved_plans for delete
  using (auth.uid() = user_id);

-- Service role can manage all plans (Edge Functions insert)
create policy "Service role manages saved_plans"
  on saved_plans for all
  using (auth.role() = 'service_role');

-- Index for fast user lookups
create index if not exists idx_saved_plans_user_id on saved_plans(user_id);
create index if not exists idx_saved_plans_created_at on saved_plans(created_at desc);
