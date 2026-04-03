-- Support ticket system tables

create table if not exists support_tickets (
  id text primary key,
  name text not null,
  email text not null,
  category text not null check (category in ('subscriptions', 'purchases', 'enquiry', 'partner_affiliate', 'others')),
  description text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  ip_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ticket_replies (
  id uuid primary key default gen_random_uuid(),
  ticket_id text not null references support_tickets(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_support_tickets_status on support_tickets(status);
create index if not exists idx_support_tickets_category on support_tickets(category);
create index if not exists idx_support_tickets_email on support_tickets(email);
create index if not exists idx_support_tickets_created_at on support_tickets(created_at desc);
create index if not exists idx_ticket_replies_ticket_id on ticket_replies(ticket_id);

-- Updated_at trigger
create or replace function update_support_ticket_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger support_tickets_updated_at
  before update on support_tickets
  for each row
  execute function update_support_ticket_timestamp();

-- RLS
alter table support_tickets enable row level security;
alter table ticket_replies enable row level security;

-- Only service role can access tickets (admin via server routes)
create policy "Service role full access on support_tickets"
  on support_tickets for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role full access on ticket_replies"
  on ticket_replies for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
