-- ─────────────────────────────────────────────
-- Teacher payout: when a teacher confirms a booking, atomically mark it
-- confirmed AND credit the teacher's wallet the full session price.
-- (Business rule chosen by the product owner: pay on confirm, full amount,
--  no platform cut.) SECURITY DEFINER so it can write the wallet/transaction
-- rows, but it verifies the caller is the booking's teacher.
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.confirm_booking(p_booking_id uuid)
RETURNS public.bookings
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_booking     public.bookings;
  v_wallet      public.wallets;
  v_skill_title text;
BEGIN
  SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id;
  IF v_booking.id IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  IF v_booking.teacher_id <> auth.uid() THEN
    RAISE EXCEPTION 'You can only confirm your own bookings';
  END IF;
  IF v_booking.status <> 'requested' THEN
    RAISE EXCEPTION 'Only pending bookings can be confirmed';
  END IF;

  UPDATE public.bookings
  SET status = 'confirmed'
  WHERE id = p_booking_id
  RETURNING * INTO v_booking;

  -- Credit the teacher their full session price
  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = auth.uid();
  IF v_wallet.id IS NOT NULL THEN
    SELECT title INTO v_skill_title FROM public.skills WHERE id = v_booking.skill_id;

    INSERT INTO public.transactions (wallet_id, type, amount, label, booking_id)
    VALUES (
      v_wallet.id, 'credit', v_booking.price * 100,
      'Earning: ' || COALESCE(v_skill_title, 'Session'), v_booking.id
    );

    UPDATE public.wallets
    SET balance = balance + v_booking.price * 100,
        updated_at = now()
    WHERE id = v_wallet.id;
  END IF;

  RETURN v_booking;
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_booking TO authenticated;
