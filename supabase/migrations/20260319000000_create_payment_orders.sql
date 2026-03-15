-- Payment orders table to track all token purchases

create table if not exists payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  provider_order_id text not null,
  tokens integer not null,
  amount_cents integer not null,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending', 'completed', 'refunded', 'failed')),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_payment_orders_provider_order
  on payment_orders (provider, provider_order_id);

alter table payment_orders enable row level security;

-- Users can read their own payment orders
create policy "Users can read own payment orders"
  on payment_orders for select
  using (auth.uid() = user_id);

-- Service role can manage all payment orders
create policy "Service role manages payment orders"
  on payment_orders for all
  using (auth.role() = 'service_role');

-- Auto-update updated_at
create or replace function update_payment_orders_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger payment_orders_updated_at
  before update on payment_orders
  for each row
  execute function update_payment_orders_timestamp();
