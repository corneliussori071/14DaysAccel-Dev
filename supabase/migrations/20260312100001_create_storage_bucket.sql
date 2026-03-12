-- Create the project-media storage bucket with public access

insert into storage.buckets (id, name, public)
values ('project-media', 'project-media', true)
on conflict (id) do nothing;

-- Allow public read access to project media files
create policy "Public read access for project media"
  on storage.objects
  for select
  to anon
  using (bucket_id = 'project-media');

-- Allow authenticated (service role) uploads
create policy "Service role upload for project media"
  on storage.objects
  for insert
  to service_role
  with check (bucket_id = 'project-media');

-- Allow authenticated (service role) deletes
create policy "Service role delete for project media"
  on storage.objects
  for delete
  to service_role
  using (bucket_id = 'project-media');
