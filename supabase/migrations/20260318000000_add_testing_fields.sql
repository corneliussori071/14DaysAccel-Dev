-- Add testing fields to projects table

alter table projects
  add column if not exists testing_available boolean not null default false,
  add column if not exists testing_instructions text,
  add column if not exists testing_url text,
  add column if not exists testing_doc_url text,
  add column if not exists testing_doc_name text;
