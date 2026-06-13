-- ─────────────────────────────────────────────
-- Phase 2.5 — Storage bucket for skill cover images.
-- Public read; authenticated users manage their own uploads.
-- ─────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('skill-covers', 'skill-covers', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "skill_covers_read"   ON storage.objects;
DROP POLICY IF EXISTS "skill_covers_insert" ON storage.objects;
DROP POLICY IF EXISTS "skill_covers_update" ON storage.objects;
DROP POLICY IF EXISTS "skill_covers_delete" ON storage.objects;

CREATE POLICY "skill_covers_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'skill-covers');

CREATE POLICY "skill_covers_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'skill-covers' AND owner = auth.uid());

CREATE POLICY "skill_covers_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'skill-covers' AND owner = auth.uid());

CREATE POLICY "skill_covers_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'skill-covers' AND owner = auth.uid());
