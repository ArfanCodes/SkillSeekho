-- ─────────────────────────────────────────────
-- Phase 2.6 — Wire the bundled teacher photos + category images
-- (now served from /public) onto the seed rows.
-- ─────────────────────────────────────────────

UPDATE public.profiles SET avatar_url = '/teachers/priya.png'  WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE public.profiles SET avatar_url = '/teachers/arjun.png'  WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE public.profiles SET avatar_url = '/teachers/meena.png'  WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE public.profiles SET avatar_url = '/teachers/ravi.png'   WHERE id = '44444444-4444-4444-4444-444444444444';
UPDATE public.profiles SET avatar_url = '/teachers/sunita.png' WHERE id = '55555555-5555-5555-5555-555555555555';
UPDATE public.profiles SET avatar_url = '/teachers/kabir.png'  WHERE id = '66666666-6666-6666-6666-666666666666';

UPDATE public.categories SET image_url = '/skills/photography.png' WHERE slug = 'photography';
UPDATE public.categories SET image_url = '/skills/cooking.png'     WHERE slug = 'cooking';
UPDATE public.categories SET image_url = '/skills/tailoring.png'   WHERE slug = 'tailoring';
UPDATE public.categories SET image_url = '/skills/language.png'    WHERE slug = 'language';
UPDATE public.categories SET image_url = '/skills/music.png'       WHERE slug = 'music';
UPDATE public.categories SET image_url = '/skills/wellness.png'    WHERE slug = 'wellness';
UPDATE public.categories SET image_url = '/skills/technology.png'  WHERE slug = 'technology';
UPDATE public.categories SET image_url = '/skills/artcraft.png'    WHERE slug = 'art-craft';
