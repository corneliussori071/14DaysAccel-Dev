-- Add status column to user_profiles for suspend/active tracking
alter table user_profiles
  add column if not exists status text not null default 'active'
  check (status in ('active', 'suspended'));

-- Add frozen flag to token_wallets
alter table token_wallets
  add column if not exists is_frozen boolean not null default false;

-- Email log for admin-sent emails
create table if not exists admin_email_log (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  category text not null,
  recipient_count integer not null default 0,
  sent_by text not null default 'admin',
  created_at timestamptz not null default now()
);

-- Only service role can manage email log
alter table admin_email_log enable row level security;

create policy "Service role manages email_log"
  on admin_email_log for all
  using (auth.role() = 'service_role');

-- Index for user_profiles status filtering
create index if not exists idx_user_profiles_status on user_profiles(status);
