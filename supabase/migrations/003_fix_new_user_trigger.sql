-- ─────────────────────────────────────────────
-- SkillSeekho — Fix: "Database error saving new user"
-- The handle_new_user() trigger runs inside Supabase's
-- auth transaction, whose search_path does NOT include
-- public. The unqualified `profiles` table and the
-- `user_role` enum cast therefore failed to resolve.
-- Pin search_path + schema-qualify everything, and add
-- a safety net so a profile hiccup never blocks signup.
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone'),
    NEW.raw_user_meta_data->>'name',
    NULLIF(NEW.raw_user_meta_data->>'role', '')::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't fail auth signup if profile insert hits a snag;
  -- the app will backfill the profile on first load.
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;
