-- Link Final Plot (FP) overlays to TP schemes (per-scheme, not global map toggle)

ALTER TABLE planning_overlays
  ADD COLUMN IF NOT EXISTS tp_scheme_id UUID REFERENCES tp_schemes(id);

ALTER TABLE planning_overlays
  ADD COLUMN IF NOT EXISTS area_name TEXT;

CREATE INDEX IF NOT EXISTS idx_planning_overlays_scheme
  ON planning_overlays(tp_scheme_id)
  WHERE layer_type = 'fp';

-- Backfill area_name on demo FP rows from block names
UPDATE planning_overlays
SET area_name = 'Vesu'
WHERE layer_type = 'fp' AND name ILIKE '%Vesu%';

UPDATE planning_overlays
SET area_name = 'Adajan'
WHERE layer_type = 'fp' AND name ILIKE '%Adajan%';

-- Associate demo FP blocks with matching TP schemes
UPDATE planning_overlays o
SET tp_scheme_id = t.id
FROM tp_schemes t
WHERE o.layer_type = 'fp'
  AND o.area_name IS NOT NULL
  AND o.area_name = t.area_name
  AND o.tp_scheme_id IS NULL;

CREATE OR REPLACE FUNCTION get_fp_overlays_for_scheme(p_scheme_id uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(f) ORDER BY f.sort_order), '[]'::json)
  FROM (
    SELECT
      id,
      layer_type::text AS layer_type,
      code,
      name,
      taluka,
      area_name,
      description,
      pdf_url,
      source_url,
      overlay_color,
      center_lat,
      center_lng,
      sort_order,
      ST_AsGeoJSON(boundary::geometry)::json AS boundary_geojson
    FROM planning_overlays
    WHERE is_published = true
      AND layer_type = 'fp'
      AND tp_scheme_id = p_scheme_id
  ) f;
$$;

GRANT EXECUTE ON FUNCTION get_fp_overlays_for_scheme(uuid) TO anon, authenticated;
