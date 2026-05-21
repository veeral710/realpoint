-- Path C: Geo-tagged news / public notices for map + TP scheme links

ALTER TABLE news_items
  ADD COLUMN IF NOT EXISTS locality_id UUID REFERENCES localities(id),
  ADD COLUMN IF NOT EXISTS tp_scheme_id UUID REFERENCES tp_schemes(id),
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_news_geo ON news_items(latitude, longitude)
  WHERE latitude IS NOT NULL AND is_published = true;

CREATE INDEX IF NOT EXISTS idx_news_scheme ON news_items(tp_scheme_id)
  WHERE tp_scheme_id IS NOT NULL;

-- Link seeded news to TP schemes / localities by area keywords in text
UPDATE news_items n
SET
  tp_scheme_id = t.id,
  locality_id = loc.id,
  latitude = t.center_lat + 0.003,
  longitude = t.center_lng - 0.002
FROM tp_schemes t
JOIN localities loc ON loc.area_name = t.area_name AND loc.district = 'Surat'
WHERE n.latitude IS NULL
  AND (
    n.summary ILIKE '%' || t.area_name || '%'
    OR n.title ILIKE '%' || t.area_name || '%'
  );

-- City-wide notices: Surat center
UPDATE news_items
SET
  latitude = 21.1702,
  longitude = 72.8311
WHERE latitude IS NULL AND is_published = true;

CREATE OR REPLACE FUNCTION get_map_notices()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.published_at DESC), '[]'::json)
  FROM (
    SELECT
      n.id,
      n.title,
      n.category::text AS category,
      n.published_at,
      n.latitude,
      n.longitude,
      n.tp_scheme_id,
      loc.area_name AS locality_name
    FROM news_items n
    LEFT JOIN localities loc ON n.locality_id = loc.id
    WHERE n.is_published = true
      AND n.latitude IS NOT NULL
      AND n.longitude IS NOT NULL
    LIMIT 200
  ) t;
$$;

CREATE OR REPLACE FUNCTION get_notices_for_scheme(p_scheme_id uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.published_at DESC), '[]'::json)
  FROM (
    SELECT
      n.id,
      n.title,
      n.summary,
      n.category::text AS category,
      n.published_at,
      n.source_url,
      n.latitude,
      n.longitude
    FROM news_items n
    JOIN tp_schemes s ON s.id = p_scheme_id
    LEFT JOIN localities loc ON n.locality_id = loc.id
    WHERE n.is_published = true
      AND (
        n.tp_scheme_id = p_scheme_id
        OR loc.area_name = s.area_name
        OR (
          n.latitude IS NOT NULL
          AND s.center_lat IS NOT NULL
          AND ST_DWithin(
            ST_MakePoint(n.longitude, n.latitude)::geography,
            ST_MakePoint(s.center_lng, s.center_lat)::geography,
            8000
          )
        )
      )
    LIMIT 20
  ) t;
$$;

GRANT EXECUTE ON FUNCTION get_map_notices() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_notices_for_scheme(uuid) TO anon, authenticated;
