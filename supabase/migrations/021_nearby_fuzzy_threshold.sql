-- ─────────────────────────────────────────────
-- Tune the typo-tolerance threshold.
--
-- 020 set word_similarity > 0.6, but a realistic single-letter typo like
-- "biriyani" vs "biryani" scores ≈0.54 and was rejected. 0.5 catches ordinary
-- misspellings while still being tight enough to avoid unrelated matches.
-- (Substring + exact-tag matching from 019 are unchanged; this only relaxes
-- the fuzzy fallback for words >= 4 chars.)
-- ─────────────────────────────────────────────

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
          WHERE tok NOT IN (
              'the','and','near','for','with','want','need','learn','learning',
              'lesson','lessons','class','classes','teacher','teachers','coaching',
              'tuition','tutor','under','around','close','find','please','some',
              'looking','any','from','that','this','can','you','who','help'
            )
            AND (
              (length(tok) >= 3 AND (
                    s.title         ILIKE '%' || tok || '%'
                    OR s.description ILIKE '%' || tok || '%'
                    OR s.location_name ILIKE '%' || tok || '%'
                    OR p.name        ILIKE '%' || tok || '%'
                    OR EXISTS (SELECT 1 FROM unnest(s.tags) t WHERE t ILIKE '%' || tok || '%')
                    OR (length(tok) >= 4 AND (
                          word_similarity(tok, lower(s.title)) > 0.5
                          OR word_similarity(tok, lower(coalesce(s.description, ''))) > 0.5
                          OR EXISTS (
                            SELECT 1 FROM unnest(s.tags) t
                            WHERE word_similarity(tok, lower(t)) > 0.5
                          )
                       ))
              ))
              OR (length(tok) = 2 AND EXISTS (
                    SELECT 1 FROM unnest(s.tags) t WHERE lower(t) = tok
                  ))
            )
        )
      )
  ) q
  WHERE p_radius_km IS NULL OR q.distance_km IS NULL OR q.distance_km <= p_radius_km
  ORDER BY q.distance_km ASC NULLS LAST, q.avg_rating DESC, q._created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.nearby_skills TO anon, authenticated;
