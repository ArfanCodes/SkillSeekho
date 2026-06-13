-- ─────────────────────────────────────────────
-- Phase 2.3 — nearby_skills(): catalogue query with real distance.
-- Haversine (no PostGIS dependency). Returns each active skill joined
-- with its teacher + rating/vouch aggregates + distance in km from the
-- learner's point. When lat/lng is null, distance is null (unsorted).
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
  SELECT * FROM (
    SELECT
      s.id, s.teacher_id, s.category_id,
      s.title, s.description,
      s.price_per_session, s.currency,
      s.tags, s.languages, s.availability,
      s.location_name, s.location_lat, s.location_lng,
      s.cover_image_url,
      p.name, p.avatar_url, p.verified,
      COALESCE(sr.avg_rating, 0)   AS avg_rating,
      COALESCE(sr.review_count, 0) AS review_count,
      COALESCE(tv.vouch_count, 0)  AS vouch_count,
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
        OR s.title ILIKE '%' || p_search || '%'
        OR s.description ILIKE '%' || p_search || '%'
        OR EXISTS (SELECT 1 FROM unnest(s.tags) t WHERE t ILIKE '%' || p_search || '%')
      )
  ) q
  WHERE p_radius_km IS NULL OR q.distance_km IS NULL OR q.distance_km <= p_radius_km
  ORDER BY q.distance_km ASC NULLS LAST, q.avg_rating DESC;
$$;

GRANT EXECUTE ON FUNCTION public.nearby_skills TO anon, authenticated;
