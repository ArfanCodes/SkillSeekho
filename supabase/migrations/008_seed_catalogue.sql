-- ─────────────────────────────────────────────
-- Phase 2.4 — Seed data (idempotent). Teachers/learners are standalone
-- profiles (is_seed = true), NOT auth.users — no login accounts created.
-- Coordinates are real Bangalore neighbourhoods so map pins are accurate.
-- ─────────────────────────────────────────────

-- ── Categories ────────────────────────────────
INSERT INTO public.categories (slug, name, icon, color, bg, sort_order) VALUES
  ('photography', 'Photography', 'Camera',        '#3B82F6', '#EFF6FF', 1),
  ('cooking',     'Cooking',     'ChefHat',       '#F59E0B', '#FFFBEB', 2),
  ('tailoring',   'Tailoring',   'Scissors',      '#EC4899', '#FDF2F8', 3),
  ('language',    'Language',    'MessageCircle', '#8B5CF6', '#F5F3FF', 4),
  ('music',       'Music',       'Music',         '#EF4444', '#FEF2F2', 5),
  ('wellness',    'Wellness',    'Leaf',          '#22C55E', '#F0FDF4', 6),
  ('technology',  'Technology',  'Code2',         '#06B6D4', '#ECFEFF', 7),
  ('art-craft',   'Art & Craft', 'Palette',       '#F97316', '#FFF7ED', 8)
ON CONFLICT (slug) DO NOTHING;

-- ── Teacher profiles (standalone, is_seed) ────
INSERT INTO public.profiles
  (id, name, role, verified, bio, languages, location_name, location_lat, location_lng, onboarding_complete, is_seed)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Priya Sharma',    'professional', true,
   'Award-winning photographer with 8 years of experience teaching beginners and professionals alike.',
   '{Hindi,English}', 'Koramangala, Bangalore', 12.9352, 77.6245, true, true),
  ('22222222-2222-2222-2222-222222222222', 'Arjun Mehta',     'professional', true,
   'Third-generation dum biryani chef. Learn the authentic Hyderabadi technique at home.',
   '{Hindi,Urdu,English}', 'HSR Layout, Bangalore', 12.9116, 77.6389, true, true),
  ('33333333-3333-3333-3333-333333333333', 'Meena Krishnan',  'professional', true,
   'Expert in traditional and western tailoring. Teaches pattern-making to Kanjivaram saree draping.',
   '{Tamil,Kannada,English}', 'Indiranagar, Bangalore', 12.9719, 77.6412, true, true),
  ('44444444-4444-4444-4444-444444444444', 'Ravi Nair',       'professional', false,
   'Former corporate trainer helping working professionals gain confidence in business English.',
   '{Malayalam,Tamil,English,Hindi}', 'Whitefield, Bangalore', 12.9698, 77.7500, true, true),
  ('55555555-5555-5555-5555-555555555555', 'Sunita Verma',    'professional', true,
   'RYT-200 certified yoga teacher. Specialises in morning Hatha and stress-relief meditation.',
   '{Hindi,English}', 'Jayanagar, Bangalore', 12.9250, 77.5938, true, true),
  ('66666666-6666-6666-6666-666666666666', 'Kabir Ansari',    'professional', true,
   'Performing musician teaching acoustic, classical and Bollywood guitar for 12 years.',
   '{Hindi,English}', 'BTM Layout, Bangalore', 12.9166, 77.6101, true, true)
ON CONFLICT (id) DO NOTHING;

-- ── Learner profiles (for reviews/vouches) ────
INSERT INTO public.profiles (id, name, role, onboarding_complete, is_seed) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Ananya Roy',   'customer', true, true),
  ('c2222222-2222-2222-2222-222222222222', 'Deepak Iyer',  'customer', true, true),
  ('c3333333-3333-3333-3333-333333333333', 'Fatima Khan',  'customer', true, true),
  ('c4444444-4444-4444-4444-444444444444', 'Vikram Singh', 'customer', true, true)
ON CONFLICT (id) DO NOTHING;

-- ── Skills (one per teacher, located at the teacher's spot) ──
INSERT INTO public.skills
  (id, teacher_id, category_id, title, description, price_per_session, tags, languages, availability, location_name, location_lat, location_lng)
VALUES
  ('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   (SELECT id FROM public.categories WHERE slug='photography'),
   'Portrait Photography', 'Master DSLR portraits — composition, lighting and editing from a working pro.',
   350, '{DSLR,Composition,Editing}', '{Hindi,English}', 'Weekends', 'Koramangala, Bangalore', 12.9352, 77.6245),
  ('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   (SELECT id FROM public.categories WHERE slug='cooking'),
   'Biryani Making', 'Authentic Hyderabadi dum biryani — spice blends, layering and the dum technique.',
   200, '{Hyderabadi,"Dum Cooking",Spices}', '{Hindi,Urdu,English}', 'Daily', 'HSR Layout, Bangalore', 12.9116, 77.6389),
  ('b3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
   (SELECT id FROM public.categories WHERE slug='tailoring'),
   'Tailoring & Fashion', 'Pattern-making, embroidery, alterations and Kanjivaram saree draping.',
   150, '{"Pattern Making",Embroidery,Alterations}', '{Tamil,Kannada,English}', 'Mon-Sat', 'Indiranagar, Bangalore', 12.9719, 77.6412),
  ('b4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444',
   (SELECT id FROM public.categories WHERE slug='language'),
   'Spoken English', 'Business English, pronunciation and interview confidence for professionals.',
   250, '{"Business English",Pronunciation,Interviews}', '{Malayalam,Tamil,English,Hindi}', 'Evenings', 'Whitefield, Bangalore', 12.9698, 77.7500),
  ('b5555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555',
   (SELECT id FROM public.categories WHERE slug='wellness'),
   'Yoga & Meditation', 'Morning Hatha yoga, pranayama and guided mindfulness for stress relief.',
   300, '{"Hatha Yoga",Pranayama,Mindfulness}', '{Hindi,English}', 'Mornings', 'Jayanagar, Bangalore', 12.9250, 77.5938),
  ('b6666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666',
   (SELECT id FROM public.categories WHERE slug='music'),
   'Guitar & Music Theory', 'Acoustic, classical and Bollywood guitar plus the theory behind it.',
   400, '{Acoustic,Classical,Bollywood}', '{Hindi,English}', 'Flexible', 'BTM Layout, Bangalore', 12.9166, 77.6101)
ON CONFLICT (id) DO NOTHING;

-- ── Reviews ───────────────────────────────────
INSERT INTO public.reviews (skill_id, teacher_id, learner_id, rating, comment) VALUES
  ('b1111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111','c1111111-1111-1111-1111-111111111111',5,'Priya taught me more in 3 sessions than months of tutorials. I shot my first paid gig!'),
  ('b1111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111','c2222222-2222-2222-2222-222222222222',5,'Fantastic composition and lighting tips. Patient and clear.'),
  ('b2222222-2222-2222-2222-222222222222','22222222-2222-2222-2222-222222222222','c2222222-2222-2222-2222-222222222222',5,'The dum biryani recipe was a family secret he graciously shared. A master teacher.'),
  ('b2222222-2222-2222-2222-222222222222','22222222-2222-2222-2222-222222222222','c3333333-3333-3333-3333-333333333333',5,'Best cooking class I have taken. My family was amazed.'),
  ('b4444444-4444-4444-4444-444444444444','44444444-4444-4444-4444-444444444444','c3333333-3333-3333-3333-333333333333',5,'I was terrified of meetings; after 2 months I presented to 50 people and got promoted!'),
  ('b4444444-4444-4444-4444-444444444444','44444444-4444-4444-4444-444444444444','c1111111-1111-1111-1111-111111111111',4,'Really helpful for interview preparation.'),
  ('b3333333-3333-3333-3333-333333333333','33333333-3333-3333-3333-333333333333','c4444444-4444-4444-4444-444444444444',5,'Learned saree draping and basic pattern-making beautifully.'),
  ('b5555555-5555-5555-5555-555555555555','55555555-5555-5555-5555-555555555555','c1111111-1111-1111-1111-111111111111',5,'The calmest mornings of my life. Highly recommend.'),
  ('b5555555-5555-5555-5555-555555555555','55555555-5555-5555-5555-555555555555','c4444444-4444-4444-4444-444444444444',4,'Great for beginners, very encouraging.'),
  ('b6666666-6666-6666-6666-666666666666','66666666-6666-6666-6666-666666666666','c2222222-2222-2222-2222-222222222222',5,'Playing Bollywood songs within weeks. Brilliant teacher.')
ON CONFLICT (skill_id, learner_id) DO NOTHING;

-- ── Vouches ───────────────────────────────────
INSERT INTO public.vouches (teacher_id, voucher_id) VALUES
  ('11111111-1111-1111-1111-111111111111','c1111111-1111-1111-1111-111111111111'),
  ('11111111-1111-1111-1111-111111111111','c2222222-2222-2222-2222-222222222222'),
  ('11111111-1111-1111-1111-111111111111','c3333333-3333-3333-3333-333333333333'),
  ('22222222-2222-2222-2222-222222222222','c2222222-2222-2222-2222-222222222222'),
  ('22222222-2222-2222-2222-222222222222','c3333333-3333-3333-3333-333333333333'),
  ('22222222-2222-2222-2222-222222222222','c4444444-4444-4444-4444-444444444444'),
  ('33333333-3333-3333-3333-333333333333','c4444444-4444-4444-4444-444444444444'),
  ('33333333-3333-3333-3333-333333333333','c1111111-1111-1111-1111-111111111111'),
  ('44444444-4444-4444-4444-444444444444','c3333333-3333-3333-3333-333333333333'),
  ('55555555-5555-5555-5555-555555555555','c1111111-1111-1111-1111-111111111111'),
  ('55555555-5555-5555-5555-555555555555','c4444444-4444-4444-4444-444444444444'),
  ('66666666-6666-6666-6666-666666666666','c2222222-2222-2222-2222-222222222222'),
  ('66666666-6666-6666-6666-666666666666','c4444444-4444-4444-4444-444444444444')
ON CONFLICT (teacher_id, voucher_id) DO NOTHING;
