-- ─────────────────────────────────────────────
-- Phase 6 — Employer jobs + teacher applications
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.jobs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id   uuid NOT NULL REFERENCES public.profiles(id)   ON DELETE CASCADE,
  category_id   uuid REFERENCES public.categories(id)          ON DELETE SET NULL,
  title         text NOT NULL,
  description   text,
  job_type      text NOT NULL DEFAULT 'part-time'
                  CHECK (job_type IN ('full-time','part-time','contract','freelance')),
  pay_min       int,                       -- whole rupees, nullable
  pay_max       int,
  location_name text,
  status        text NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open','closed')),
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS jobs_employer_idx ON public.jobs(employer_id);
CREATE INDEX IF NOT EXISTS jobs_status_idx   ON public.jobs(status);

CREATE TABLE IF NOT EXISTS public.job_applications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      uuid NOT NULL REFERENCES public.jobs(id)      ON DELETE CASCADE,
  teacher_id  uuid NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  note        text,
  status      text NOT NULL DEFAULT 'applied'
                CHECK (status IN ('applied','shortlisted','rejected')),
  created_at  timestamptz DEFAULT now(),
  UNIQUE (job_id, teacher_id)              -- one application per teacher per job
);

CREATE INDEX IF NOT EXISTS applications_job_idx     ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS applications_teacher_idx ON public.job_applications(teacher_id);

-- ── RLS: jobs ─────────────────────────────────
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Anyone signed in can see open jobs; employers see all their own jobs
CREATE POLICY "jobs_select" ON public.jobs
  FOR SELECT USING (status = 'open' OR employer_id = auth.uid());

CREATE POLICY "jobs_insert_own" ON public.jobs
  FOR INSERT WITH CHECK (employer_id = auth.uid());

CREATE POLICY "jobs_update_own" ON public.jobs
  FOR UPDATE USING (employer_id = auth.uid()) WITH CHECK (employer_id = auth.uid());

CREATE POLICY "jobs_delete_own" ON public.jobs
  FOR DELETE USING (employer_id = auth.uid());

-- ── RLS: applications ─────────────────────────
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Teacher sees their own applications; employer sees applications to their jobs
CREATE POLICY "applications_select" ON public.job_applications
  FOR SELECT USING (
    teacher_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.employer_id = auth.uid())
  );

-- Teacher applies to an open job
CREATE POLICY "applications_insert_teacher" ON public.job_applications
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.status = 'open')
  );

-- Employer updates status (shortlist/reject) on applications to their jobs
CREATE POLICY "applications_update_employer" ON public.job_applications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.employer_id = auth.uid())
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs             TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON public.job_applications TO authenticated;
