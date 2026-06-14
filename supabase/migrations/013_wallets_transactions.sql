-- ─────────────────────────────────────────────
-- Phase 4 — Wallets & Transactions
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.wallets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance     int  NOT NULL DEFAULT 0,   -- in paise (₹1 = 100 paise)
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id     uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  type          text NOT NULL CHECK (type IN ('credit','debit')),
  amount        int  NOT NULL CHECK (amount > 0),   -- always positive, in paise
  label         text NOT NULL,
  reference_id  text,
  booking_id    uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_wallet_idx ON public.transactions(wallet_id, created_at DESC);

-- ── Auto-create wallet on profile insert ──────
CREATE OR REPLACE FUNCTION public.create_wallet_for_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_create_wallet ON public.profiles;
CREATE TRIGGER on_profile_created_create_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_wallet_for_profile();

-- Back-fill wallets for existing profiles that predate this migration
INSERT INTO public.wallets (user_id)
SELECT id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- ── RLS ───────────────────────────────────────
ALTER TABLE public.wallets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallets_select_own" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

-- No direct INSERT/UPDATE for wallets from clients — managed via transactions
CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.wallets w
      WHERE w.id = wallet_id AND w.user_id = auth.uid()
    )
  );

-- Transactions are inserted only by server-side logic (service role),
-- so no authenticated INSERT policy is granted here intentionally.

GRANT SELECT ON public.wallets      TO authenticated;
GRANT SELECT ON public.transactions TO authenticated;

-- ── RPC: atomic balance increment (avoids client-side race conditions) ──
CREATE OR REPLACE FUNCTION public.increment_wallet_balance(p_wallet_id uuid, p_delta int)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.wallets
  SET balance    = balance + p_delta,
      updated_at = now()
  WHERE id = p_wallet_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_wallet_balance TO authenticated;
