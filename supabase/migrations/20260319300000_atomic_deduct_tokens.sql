-- Atomic token deduction function to prevent race conditions
-- Uses UPDATE ... WHERE balance >= amount pattern for atomicity

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
