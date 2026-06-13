-- ─────────────────────────────────────────────
-- Phase 2.0 — Allow seed/catalogue profiles that are NOT backed by an
-- auth.users row, so we can populate teachers without creating real
-- login accounts. Real signups still flow through handle_new_user().
-- ─────────────────────────────────────────────

-- Drop the hard FK to auth.users; keep id as a standalone uuid pk.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Flag seed rows so they can be filtered / purged later.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false;

-- Replace the lost ON DELETE CASCADE: deleting an auth user removes its profile.
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();
