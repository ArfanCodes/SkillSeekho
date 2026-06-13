-- ─────────────────────────────────────────────
-- Phase 2.2 — Reviews & Vouches (minimal, real-backed)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id    uuid NOT NULL REFERENCES public.skills(id)   ON DELETE CASCADE,
  teacher_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  learner_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      int  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (skill_id, learner_id)        -- one review per learner per skill
);
CREATE INDEX IF NOT EXISTS reviews_skill_idx   ON public.reviews(skill_id);
CREATE INDEX IF NOT EXISTS reviews_teacher_idx ON public.reviews(teacher_id);

CREATE TABLE IF NOT EXISTS public.vouches (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  voucher_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  note        text,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (teacher_id, voucher_id)      -- can't vouch for the same teacher twice
);
CREATE INDEX IF NOT EXISTS vouches_teacher_idx ON public.vouches(teacher_id);

-- ── Aggregate views (cards read these — always real) ──
CREATE OR REPLACE VIEW public.skill_ratings AS
  SELECT skill_id,
         round(avg(rating)::numeric, 2) AS avg_rating,
         count(*)                        AS review_count
  FROM public.reviews
  GROUP BY skill_id;

CREATE OR REPLACE VIEW public.teacher_vouch_counts AS
  SELECT teacher_id, count(*) AS vouch_count
  FROM public.vouches
  GROUP BY teacher_id;

-- ── RLS ───────────────────────────────────────
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = learner_id);
CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE USING (auth.uid() = learner_id) WITH CHECK (auth.uid() = learner_id);
CREATE POLICY "reviews_delete_own" ON public.reviews
  FOR DELETE USING (auth.uid() = learner_id);

CREATE POLICY "vouches_select_all" ON public.vouches FOR SELECT USING (true);
CREATE POLICY "vouches_insert_own" ON public.vouches
  FOR INSERT WITH CHECK (auth.uid() = voucher_id);
CREATE POLICY "vouches_delete_own" ON public.vouches
  FOR DELETE USING (auth.uid() = voucher_id);

GRANT SELECT ON public.skill_ratings, public.teacher_vouch_counts TO anon, authenticated;
