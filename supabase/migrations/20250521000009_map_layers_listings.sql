-- Phase 3c: DP/FP overlays, map RPCs, listing coordinates for pins

CREATE TABLE planning_overlays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  layer_type map_layer_type NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  name_gu TEXT,
  district TEXT NOT NULL DEFAULT 'Surat',
  taluka TEXT,
  description TEXT,
  source_url TEXT,
  pdf_url TEXT,
  center_lat DOUBLE PRECISION NOT NULL,
  center_lng DOUBLE PRECISION NOT NULL,
  boundary GEOGRAPHY(Polygon, 4326),
  overlay_color TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT planning_overlays_layer_check CHECK (layer_type IN ('dp', 'fp'))
);

CREATE INDEX idx_planning_overlays_type ON planning_overlays(layer_type, is_published);
CREATE INDEX idx_planning_overlays_boundary ON planning_overlays USING GIST (boundary);

ALTER TABLE planning_overlays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published planning overlays are public"
  ON planning_overlays FOR SELECT TO anon, authenticated
  USING (is_published = true OR is_admin());

CREATE POLICY "Admins manage planning overlays"
  ON planning_overlays FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- DP / FP demo overlays (wider zones than TP schemes)
INSERT INTO planning_overlays (
  layer_type, code, name, name_gu, taluka, description, source_url,
  center_lat, center_lng, boundary, overlay_color, sort_order, is_published
) VALUES
(
  'dp', 'DP-Surat-West', 'Surat Development Plan — West', 'પશ્ચિમ વિકાસ યોજના',
  'Surat City', 'Indicative DP west corridor overlay for map reference.',
  'https://www.sudaonline.org', 21.195, 72.56,
  ST_GeogFromText('POLYGON((72.52 21.17, 72.60 21.17, 72.60 21.24, 72.52 21.24, 72.52 21.17))'),
  '#1565c0', 1, true
),
(
  'dp', 'DP-Surat-East', 'Surat Development Plan — East', 'પૂર્વ વિકાસ યોજના',
  'Surat City', 'Indicative DP east corridor including Varachha–Udhna belt.',
  'https://www.sudaonline.org', 21.21, 72.85,
  ST_GeogFromText('POLYGON((72.80 21.18, 72.90 21.18, 72.90 21.26, 72.80 21.26, 72.80 21.18))'),
  '#1976d2', 2, true
),
(
  'fp', 'FP-Vesu-Block', 'Final Plot — Vesu block', 'વેસુ ફાઇનલ પ્લોટ',
  'Surat City', 'Sample FP sheet block for Vesu (demo).',
  'https://www.sudaonline.org', 21.145, 72.775,
  ST_GeogFromText('POLYGON((72.762 21.132, 72.788 21.132, 72.788 21.158, 72.762 21.158, 72.762 21.132))'),
  '#c62828', 1, true
),
(
  'fp', 'FP-Adajan-Block', 'Final Plot — Adajan block', 'અડાજણ ફાઇનલ પ્લોટ',
  'Surat City', 'Sample FP sheet block for Adajan (demo).',
  'https://www.sudaonline.org', 21.198, 72.582,
  ST_GeogFromText('POLYGON((72.568 21.188, 72.596 21.188, 72.596 21.210, 72.568 21.210, 72.568 21.188))'),
  '#d32f2f', 2, true
);

-- Backfill listing map coordinates from matching TP scheme by locality area
UPDATE listings l
SET
  latitude = t.center_lat + ((abs(hashtext(l.id::text)) % 100) - 50) * 0.00008,
  longitude = t.center_lng + ((abs(hashtext(l.id::text || 'lng')) % 100) - 50) * 0.00008,
  tp_scheme_id = COALESCE(l.tp_scheme_id, t.id)
FROM localities loc
JOIN tp_schemes t ON t.area_name = loc.area_name AND t.is_published = true
WHERE l.locality_id = loc.id
  AND l.status = 'published'
  AND l.latitude IS NULL;

CREATE OR REPLACE FUNCTION get_map_villages()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  FROM (
    SELECT
      id,
      name,
      taluka,
      center_lat,
      center_lng,
      '#7b1fa2' AS overlay_color,
      ST_AsGeoJSON(boundary::geometry)::json AS boundary_geojson
    FROM villages
    WHERE is_published = true
  ) t;
$$;

CREATE OR REPLACE FUNCTION get_map_planning_overlays(p_layer_type text DEFAULT NULL)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.sort_order), '[]'::json)
  FROM (
    SELECT
      id,
      layer_type::text AS layer_type,
      code,
      name,
      taluka,
      center_lat,
      center_lng,
      overlay_color,
      sort_order,
      ST_AsGeoJSON(boundary::geometry)::json AS boundary_geojson
    FROM planning_overlays
    WHERE is_published = true
      AND (p_layer_type IS NULL OR layer_type::text = p_layer_type)
  ) t;
$$;

CREATE OR REPLACE FUNCTION get_map_listings(p_intent text DEFAULT NULL)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.created_at DESC), '[]'::json)
  FROM (
    SELECT
      l.id,
      l.title,
      l.intent::text AS intent,
      l.property_class::text AS property_class,
      l.price,
      l.latitude,
      l.longitude,
      l.created_at,
      loc.area_name AS locality_name,
      t.scheme_number AS tp_scheme_number
    FROM listings l
    LEFT JOIN localities loc ON l.locality_id = loc.id
    LEFT JOIN tp_schemes t ON l.tp_scheme_id = t.id
    WHERE l.status = 'published'
      AND l.latitude IS NOT NULL
      AND l.longitude IS NOT NULL
      AND (p_intent IS NULL OR p_intent = '' OR l.intent::text = p_intent)
    LIMIT 100
  ) t;
$$;

GRANT EXECUTE ON FUNCTION get_map_villages() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_map_planning_overlays(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_map_listings(text) TO anon, authenticated;
