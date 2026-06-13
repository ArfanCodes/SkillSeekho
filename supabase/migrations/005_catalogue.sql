-- ─────────────────────────────────────────────
-- Phase 2.1 — Catalogue: categories + skill listings
-- ─────────────────────────────────────────────

-- ── Categories ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  icon        text,             -- lucide-react icon name
  color       text,
  bg          text,
  image_url   text,
  sort_order  int DEFAULT 0,
  active      boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- ── Skills (one listing by a professional; a teacher may have many) ──
CREATE TABLE IF NOT EXISTS public.skills (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id       uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  title             text NOT NULL,
  description       text,
  price_per_session int  NOT NULL DEFAULT 0,   -- whole rupees
  currency          text NOT NULL DEFAULT 'INR',
  tags              text[] DEFAULT '{}',
  languages         text[] DEFAULT '{}',
  availability      text,
  location_name     text,
  location_lat      double precision,
  location_lng      double precision,
  cover_image_url   text,
  active            boolean NOT NULL DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS skills_teacher_idx  ON public.skills(teacher_id);
CREATE INDEX IF NOT EXISTS skills_category_idx ON public.skills(category_id);
CREATE INDEX IF NOT EXISTS skills_tags_idx     ON public.skills USING gin(tags);

-- reuse set_updated_at() from migration 001
DROP TRIGGER IF EXISTS skills_updated_at ON public.skills;
CREATE TRIGGER skills_updated_at
  BEFORE UPDATE ON public.skills
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Live category counts (never stored, so they can't drift) ──
CREATE OR REPLACE VIEW public.category_skill_counts AS
  SELECT c.id AS category_id, count(s.id) AS count
  FROM public.categories c
  LEFT JOIN public.skills s ON s.category_id = c.id AND s.active
  GROUP BY c.id;

-- ── RLS ───────────────────────────────────────
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_all" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "skills_select_active" ON public.skills
  FOR SELECT USING (active OR auth.uid() = teacher_id);
CREATE POLICY "skills_insert_own" ON public.skills
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "skills_update_own" ON public.skills
  FOR UPDATE USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "skills_delete_own" ON public.skills
  FOR DELETE USING (auth.uid() = teacher_id);

GRANT SELECT ON public.category_skill_counts TO anon, authenticated;
