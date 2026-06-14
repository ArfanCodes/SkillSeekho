-- ─────────────────────────────────────────────
-- Robust skill matching for the learner catalogue.
--
-- Goal: a learner must reliably surface a teacher when even ONE of their
-- query words matches the skill — on the title, description, a single tag,
-- the location, or the teacher's name — AND tolerate typos / word variants
-- so a match never silently fails.
--
-- How:
--   • Tokenize the learner's query (split on whitespace), drop stopwords.
--   • A skill matches if ANY token (>=2 chars) is a substring of any field
--     OR (for tokens >=4 chars) is fuzzy-similar (pg_trgm) to the title or
--     any tag. One matching tag is enough.
--   • Newly added skills (no location yet → NULL distance) are ordered to the
--     top of the "no distance" group by created_at, so they show up promptly.
-- ─────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram indexes so fuzzy/substring matching stays fast as the catalogue grows.
CREATE INDEX IF NOT EXISTS skills_title_trgm_idx
  ON public.skills USING gin (lower(title) gin_trgm_ops);

CREATE OR REPLACE FUNCTION public.nearby_skills(
  p_lat           double precision DEFAULT NULL,
  p_lng           double precision DEFAULT NULL,
  p_radius_km     double precision DEFAULT NULL,
  p_category      uuid    DEFAULT NULL,
  p_max_price     int     DEFAULT NULL,
  p_verified_only boolean DEFAULT false,
  p_search        text    DEFAULT NULL
)
RETURNS TABLE (
  id uuid, teacher_id uuid, category_id uuid,
  title text, description text,
  price_per_session int, currency text,
  tags text[], languages text[], availability text,
  location_name text, location_lat double precision, location_lng double precision,
  cover_image_url text,
  teacher_name text, teacher_avatar_url text, teacher_verified boolean,
  avg_rating numeric, review_count bigint, vouch_count bigint,
  distance_km double precision
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    q.id, q.teacher_id, q.category_id,
    q.title, q.description,
    q.price_per_session, q.currency,
    q.tags, q.languages, q.availability,
    q.location_name, q.location_lat, q.location_lng,
    q.cover_image_url,
    q.teacher_name, q.teacher_avatar_url, q.teacher_verified,
    q.avg_rating, q.review_count, q.vouch_count,
    q.distance_km
  FROM (
    SELECT
      s.id, s.teacher_id, s.category_id,
      s.title, s.description,
      s.price_per_session, s.currency,
      s.tags, s.languages, s.availability,
      s.location_name, s.location_lat, s.location_lng,
      s.cover_image_url,
      p.name AS teacher_name, p.avatar_url AS teacher_avatar_url, p.verified AS teacher_verified,
      COALESCE(sr.avg_rating, 0)   AS avg_rating,
      COALESCE(sr.review_count, 0) AS review_count,
      COALESCE(tv.vouch_count, 0)  AS vouch_count,
      s.created_at AS _created_at,
      CASE
        WHEN p_lat IS NULL OR p_lng IS NULL OR s.location_lat IS NULL OR s.location_lng IS NULL
        THEN NULL
        ELSE 6371 * acos(LEAST(1, GREATEST(-1,
          cos(radians(p_lat)) * cos(radians(s.location_lat)) *
          cos(radians(s.location_lng) - radians(p_lng)) +
          sin(radians(p_lat)) * sin(radians(s.location_lat))
        )))
      END AS distance_km
    FROM public.skills s
    JOIN public.profiles p              ON p.id = s.teacher_id
    LEFT JOIN public.skill_ratings sr   ON sr.skill_id = s.id
    LEFT JOIN public.teacher_vouch_counts tv ON tv.teacher_id = s.teacher_id
    WHERE s.active
      AND (p_category  IS NULL OR s.category_id = p_category)
      AND (p_max_price IS NULL OR s.price_per_session <= p_max_price)
      AND (NOT p_verified_only OR p.verified)
      AND (
        p_search IS NULL
        OR trim(p_search) = ''
        OR EXISTS (
          SELECT 1
          FROM unnest(regexp_split_to_array(lower(trim(p_search)), '\s+')) AS tok
          WHERE length(tok) >= 2
            AND tok NOT IN (
              'the','and','near','for','with','want','need','learn','learning',
              'lesson','lessons','class','classes','teacher','teachers','coaching',
              'tuition','tutor','under','around','close','find','please','some',
              'looking','any','from','that','this','can','you','who','help'
            )
            AND (
              -- substring match: one matching word on any field is enough,
              -- and a single matching TAG counts.
              s.title         ILIKE '%' || tok || '%'
              OR s.description ILIKE '%' || tok || '%'
              OR s.location_name ILIKE '%' || tok || '%'
              OR p.name        ILIKE '%' || tok || '%'
              OR EXISTS (SELECT 1 FROM unnest(s.tags) t WHERE t ILIKE '%' || tok || '%')
              -- fuzzy match (typo / word-variant tolerant) for longer words,
              -- so a match never silently fails on a small spelling difference.
              OR (length(tok) >= 4 AND (
                    similarity(lower(s.title), tok) > 0.35
                    OR EXISTS (
                      SELECT 1 FROM unnest(s.tags) t
                      WHERE similarity(lower(t), tok) > 0.35
                    )
                 ))
            )
        )
      )
  ) q
  WHERE p_radius_km IS NULL OR q.distance_km IS NULL OR q.distance_km <= p_radius_km
  ORDER BY q.distance_km ASC NULLS LAST, q.avg_rating DESC, q._created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.nearby_skills TO anon, authenticated;
