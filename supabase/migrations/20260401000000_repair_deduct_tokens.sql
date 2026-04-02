-- Repair: recreate deduct_tokens function to fix "Failed to deduct tokens" 500 error.
-- Uses CREATE OR REPLACE so this is safe to run even if the function already exists.
-- Also notifies PostgREST to reload the schema cache.

-- Ensure token tables exist (idempotent)
CREATE TABLE IF NOT EXISTS token_wallets (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_tokens integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tokens_used integer NOT NULL,
  operation_type text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Recreate atomic deduction function
CREATE OR REPLACE FUNCTION public.deduct_tokens(
  p_user_id UUID,
  p_amount INT,
  p_operation_type TEXT,
  p_description TEXT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INT;
BEGIN
  -- Atomic deduction: only succeeds if balance >= amount
  UPDATE token_wallets
  SET balance_tokens = balance_tokens - p_amount
  WHERE user_id = p_user_id
    AND balance_tokens >= p_amount
  RETURNING balance_tokens INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient token balance';
  END IF;

  -- Log the transaction
  INSERT INTO token_transactions (user_id, tokens_used, operation_type, description)
  VALUES (p_user_id, p_amount, p_operation_type, p_description);

  RETURN v_new_balance;
END;
$$;

-- Grant execute to authenticated and service_role
GRANT EXECUTE ON FUNCTION public.deduct_tokens(UUID, INT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_tokens(UUID, INT, TEXT, TEXT) TO service_role;

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
