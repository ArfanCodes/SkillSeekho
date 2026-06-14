-- ─────────────────────────────────────────────
-- Phase 4 — Wallet transaction RPC
-- Single SECURITY DEFINER entry point for crediting/debiting a wallet.
-- The transactions table has no client INSERT policy on purpose (see 013);
-- all wallet writes must go through here, which validates the caller owns
-- the wallet and enforces sufficient balance on debit — atomically.
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.wallet_transact(
  p_type        text,
  p_amount      int,                 -- paise, always positive
  p_label       text,
  p_booking_id  uuid DEFAULT NULL,
  p_reference_id text DEFAULT NULL
)
RETURNS public.transactions
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_wallet  public.wallets;
  v_txn     public.transactions;
BEGIN
  IF p_type NOT IN ('credit', 'debit') THEN
    RAISE EXCEPTION 'Invalid transaction type: %', p_type;
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be a positive number of paise';
  END IF;

  -- Resolve the caller's own wallet
  SELECT * INTO v_wallet
  FROM public.wallets
  WHERE user_id = auth.uid();

  IF v_wallet.id IS NULL THEN
    RAISE EXCEPTION 'No wallet found for the current user';
  END IF;

  IF p_type = 'debit' AND v_wallet.balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  INSERT INTO public.transactions (wallet_id, type, amount, label, booking_id, reference_id)
  VALUES (v_wallet.id, p_type, p_amount, p_label, p_booking_id, p_reference_id)
  RETURNING * INTO v_txn;

  UPDATE public.wallets
  SET balance    = balance + (CASE WHEN p_type = 'credit' THEN p_amount ELSE -p_amount END),
      updated_at = now()
  WHERE id = v_wallet.id;

  RETURN v_txn;
END;
$$;

GRANT EXECUTE ON FUNCTION public.wallet_transact TO authenticated;
