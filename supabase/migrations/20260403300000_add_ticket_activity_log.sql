-- Add admin_name to ticket_replies and create ticket_activity for status changes

alter table ticket_replies add column if not exists admin_name text not null default 'Admin';

create table if not exists ticket_activity (
  id uuid primary key default gen_random_uuid(),
  ticket_id text not null references support_tickets(id) on delete cascade,
  action text not null,
  admin_name text not null,
  details text,
  created_at timestamptz not null default now()
);

create index if not exists idx_ticket_activity_ticket_id on ticket_activity(ticket_id);

alter table ticket_activity enable row level security;

create policy "Service role full access on ticket_activity"
  on ticket_activity for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
