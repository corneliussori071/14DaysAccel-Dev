-- Private storage bucket for project source code and supplementary files

insert into storage.buckets (id, name, public)
values ('project-source-code', 'project-source-code', false)
on conflict (id) do nothing;

-- Service role can upload files
create policy "Service role upload for source code"
  on storage.objects
  for insert
  to service_role
  with check (bucket_id = 'project-source-code');

-- Service role can read files (for signed URL generation)
create policy "Service role read for source code"
  on storage.objects
  for select
  to service_role
  using (bucket_id = 'project-source-code');

-- Service role can delete files
create policy "Service role delete for source code"
  on storage.objects
  for delete
  to service_role
  using (bucket_id = 'project-source-code');
