-- Add generated_prompts column to saved_plans for storing staged prompt history
alter table saved_plans
  add column if not exists generated_prompts jsonb not null default '{}';

-- Allow users to update their own saved plans (for storing generated prompts)
create policy "Users can update own plans"
  on saved_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
