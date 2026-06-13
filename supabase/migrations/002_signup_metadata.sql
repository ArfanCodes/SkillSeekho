-- ─────────────────────────────────────────────
-- SkillSeekho — Phase 1.1: Email/password signup
-- Stamp role + name onto the profile at creation
-- time, pulled from auth signUp() metadata.
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, phone, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone'),
    NEW.raw_user_meta_data->>'name',
    NULLIF(NEW.raw_user_meta_data->>'role', '')::user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
