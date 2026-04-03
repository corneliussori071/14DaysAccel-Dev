-- Repair: the previous migration failed at the moddatetime trigger.
-- Drop the partially-created objects and recreate with a custom trigger function.

drop trigger if exists support_tickets_updated_at on support_tickets;
drop function if exists update_support_ticket_timestamp();

-- The tables and indexes were created successfully; only add the missing trigger.
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
