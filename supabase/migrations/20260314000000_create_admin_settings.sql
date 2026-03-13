-- Admin settings key-value store for all admin configuration
create table if not exists admin_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- Row Level Security
alter table admin_settings enable row level security;

-- Only service role can manage admin settings (Edge Functions and API routes use service role)
create policy "Service role manages admin_settings"
  on admin_settings for all
  using (auth.role() = 'service_role');

-- Auto-update updated_at
create or replace function update_admin_settings_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger admin_settings_updated_at
  before update on admin_settings
  for each row
  execute function update_admin_settings_timestamp();

-- Seed default settings
insert into admin_settings (key, value) values
  ('token_pricing', '[
    {"model_id": "claude-opus-4-6", "model_label": "Claude Opus 4.6", "token_multiplier": 3, "cost_per_token_usd": 0.0009},
    {"model_id": "claude-sonnet-4-6", "model_label": "Claude Sonnet 4.6", "token_multiplier": 1, "cost_per_token_usd": 0.0003},
    {"model_id": "gpt-5.4", "model_label": "GPT 5.4", "token_multiplier": 1, "cost_per_token_usd": 0.0003},
    {"model_id": "gpt-5.3-codex", "model_label": "GPT 5.3 Codex", "token_multiplier": 1, "cost_per_token_usd": 0.0003}
  ]'::jsonb),
  ('subscription_plans', '[]'::jsonb),
  ('free_benefits', '{"free_tokens_on_signup": 1000, "free_trial_days": 14, "trial_token_limit": 5000, "is_free_trial_active": true}'::jsonb),
  ('communication', '{"support_email": "", "notification_email_enabled": true, "welcome_email_enabled": true, "low_token_alert_threshold": 100, "low_token_alert_enabled": true}'::jsonb),
  ('emergency', '{"maintenance_mode": false, "maintenance_message": "", "ai_services_disabled": false, "signups_disabled": false, "disable_reason": ""}'::jsonb)
on conflict (key) do nothing;
