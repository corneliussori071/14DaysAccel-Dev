-- Add payment_providers setting for toggling between Lemon Squeezy and FastSpring
insert into admin_settings (key, value) values
  ('payment_providers', '{"active_provider": "lemonsqueezy"}'::jsonb)
on conflict (key) do nothing;
