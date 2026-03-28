-- Project Marketplace: pricing, reactions, comments, interests, purchases

-- 1. Extend projects table with marketplace fields
alter table projects
  add column if not exists price_usd numeric(10,2) default null,
  add column if not exists product_path text default null,
  add column if not exists product_variable text default null,
  add column if not exists source_code_url text default null,
  add column if not exists source_code_name text default null,
  add column if not exists source_code_size bigint default null,
  add column if not exists supplementary_files jsonb default '[]',
  add column if not exists likes_count int not null default 0,
  add column if not exists dislikes_count int not null default 0,
  add column if not exists comments_count int not null default 0;

-- 2. Project reactions table
create table if not exists project_reactions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

alter table project_reactions enable row level security;

create policy "Users can read own reactions"
  on project_reactions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own reactions"
  on project_reactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own reactions"
  on project_reactions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own reactions"
  on project_reactions for delete
  to authenticated
  using (auth.uid() = user_id);

-- 3. Project comments table
create table if not exists project_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table project_comments enable row level security;

create policy "Anyone can read comments"
  on project_comments for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert comments"
  on project_comments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own comments"
  on project_comments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on project_comments for delete
  to authenticated
  using (auth.uid() = user_id);

-- 4. Project interests table (register interest for upcoming projects)
create table if not exists project_interests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  email text not null,
  name text default null,
  created_at timestamptz not null default now(),
  unique (project_id, email)
);

alter table project_interests enable row level security;

create policy "Anyone can register interest"
  on project_interests for insert
  to anon, authenticated
  with check (true);

create policy "Service role reads interests"
  on project_interests for select
  to service_role
  using (true);

create policy "Service role deletes interests"
  on project_interests for delete
  to service_role
  using (true);

-- 5. Project purchases table
create table if not exists project_purchases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  provider_order_id text not null,
  amount_cents int not null,
  currency text not null default 'USD',
  status text not null default 'completed' check (status in ('pending', 'completed', 'refunded', 'failed')),
  download_token uuid not null default gen_random_uuid(),
  download_expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  unique (provider, provider_order_id)
);

alter table project_purchases enable row level security;

create policy "Users can read own purchases"
  on project_purchases for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Service role manages purchases"
  on project_purchases for all
  to service_role
  using (true)
  with check (true);

-- 6. Trigger function: sync reaction counts to projects table
create or replace function sync_reaction_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_project_id uuid;
begin
  if tg_op = 'DELETE' then
    target_project_id := old.project_id;
  else
    target_project_id := new.project_id;
  end if;

  update projects set
    likes_count = (
      select count(*) from project_reactions
      where project_id = target_project_id and reaction_type = 'like'
    ),
    dislikes_count = (
      select count(*) from project_reactions
      where project_id = target_project_id and reaction_type = 'dislike'
    )
  where id = target_project_id;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger trg_sync_reaction_counts
  after insert or update or delete on project_reactions
  for each row execute function sync_reaction_counts();

-- 7. Trigger function: sync comment count to projects table
create or replace function sync_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_project_id uuid;
begin
  if tg_op = 'DELETE' then
    target_project_id := old.project_id;
  else
    target_project_id := new.project_id;
  end if;

  update projects set
    comments_count = (
      select count(*) from project_comments
      where project_id = target_project_id
    )
  where id = target_project_id;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger trg_sync_comment_count
  after insert or delete on project_comments
  for each row execute function sync_comment_count();

-- 8. Auto-update updated_at on project_comments
create or replace function update_comment_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_comment_updated_at
  before update on project_comments
  for each row execute function update_comment_updated_at();
