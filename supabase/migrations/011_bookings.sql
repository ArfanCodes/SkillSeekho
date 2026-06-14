-- ─────────────────────────────────────────────
-- Phase 4 — Bookings
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bookings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id      uuid NOT NULL REFERENCES public.skills(id)   ON DELETE CASCADE,
  scheduled_at  timestamptz NOT NULL,
  status        text NOT NULL DEFAULT 'requested'
                  CHECK (status IN ('requested','confirmed','completed','cancelled')),
  price         int  NOT NULL,   -- whole rupees, copied from skill at booking time
  payment_id    text,
  notes         text,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bookings_learner_idx  ON public.bookings(learner_id);
CREATE INDEX IF NOT EXISTS bookings_teacher_idx  ON public.bookings(teacher_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx   ON public.bookings(status);

-- ── RLS ───────────────────────────────────────
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Learner: insert their own bookings
CREATE POLICY "bookings_insert_learner" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = learner_id);

-- Learner: view their own bookings
CREATE POLICY "bookings_select_learner" ON public.bookings
  FOR SELECT USING (auth.uid() = learner_id);

-- Teacher: view bookings for their skills
CREATE POLICY "bookings_select_teacher" ON public.bookings
  FOR SELECT USING (auth.uid() = teacher_id);

-- Teacher: update status (confirm / cancel) on their bookings
CREATE POLICY "bookings_update_teacher" ON public.bookings
  FOR UPDATE USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Learner: cancel their own requested bookings
CREATE POLICY "bookings_cancel_learner" ON public.bookings
  FOR UPDATE USING (auth.uid() = learner_id AND status = 'requested')
  WITH CHECK (auth.uid() = learner_id AND status = 'cancelled');

GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
