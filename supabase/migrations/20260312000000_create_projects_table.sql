create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text not null,
  features text[] not null default '{}',
  tech_stack text[] not null default '{}',
  status text not null default 'upcoming' check (status in ('available', 'upcoming')),
  featured boolean not null default false,
  upwork_link text,
  youtube_link text,
  tiktok_link text,
  created_at timestamptz not null default now()
);

alter table projects enable row level security;

create policy "Allow public read access to projects"
  on projects
  for select
  to anon
  using (true);
