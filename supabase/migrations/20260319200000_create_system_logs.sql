-- System logs table for centralized error/event logging
CREATE TABLE IF NOT EXISTS public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL CHECK (level IN ('info', 'warn', 'error', 'critical')),
  source text NOT NULL DEFAULT 'server',
  message text NOT NULL,
  details jsonb,
  path text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX idx_system_logs_level ON public.system_logs (level);
CREATE INDEX idx_system_logs_created_at ON public.system_logs (created_at DESC);
CREATE INDEX idx_system_logs_source ON public.system_logs (source);

-- Enable RLS (service_role only — no anon/authenticated access)
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- No RLS policies = only service_role can read/write (bypasses RLS)
