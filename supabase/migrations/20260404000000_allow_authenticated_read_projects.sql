-- Allow authenticated users to read projects (previously only anon could)
create policy "Allow authenticated read access to projects"
  on projects
  for select
  to authenticated
  using (true);
