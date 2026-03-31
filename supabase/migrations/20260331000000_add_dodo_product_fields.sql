-- Add Dodo Payments product ID columns to projects table
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS dodo_product_path TEXT,
  ADD COLUMN IF NOT EXISTS dodo_product_variable TEXT;
