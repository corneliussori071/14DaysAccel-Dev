-- Add media_files (jsonb array) and profile_image (text URL) columns

alter table projects
  add column if not exists media_files jsonb not null default '[]',
  add column if not exists profile_image text;
