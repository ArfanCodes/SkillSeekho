-- ─────────────────────────────────────────────
-- SkillSeekho — Phase 1: Auth & Profiles Schema
-- ─────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Role enum
CREATE TYPE user_role AS ENUM ('customer', 'professional', 'employer');

-- ── Profiles ──────────────────────────────────
CREATE TABLE profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                TEXT,
  phone               TEXT,
  avatar_url          TEXT,
  role                user_role,
  bio                 TEXT,
  languages           TEXT[]    DEFAULT '{}',
  location_lat        DOUBLE PRECISION,
  location_lng        DOUBLE PRECISION,
  location_name       TEXT,
  verified            BOOLEAN   DEFAULT FALSE,
  onboarding_complete BOOLEAN   DEFAULT FALSE,
  -- professional-only
  availability        TEXT,
  -- employer-only
  company_name        TEXT,
  company_type        TEXT,
  website             TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create profile row when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Row Level Security ─────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read any profile (needed for discover/search)
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

-- Users can only insert their own profile
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
