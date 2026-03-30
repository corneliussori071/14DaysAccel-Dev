-- Add payment_providers setting for the active payment gateway
insert into admin_settings (key, value) values
  ('payment_providers', '{"active_provider": "creem"}'::jsonb)
on conflict (key) do nothing;
