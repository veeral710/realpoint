-- Path B: optional georeferenced raster "TP sheet" overlay per scheme (demo URLs)

ALTER TABLE tp_schemes
  ADD COLUMN IF NOT EXISTS raster_overlay_url TEXT,
  ADD COLUMN IF NOT EXISTS raster_opacity REAL NOT NULL DEFAULT 0.55;

-- Grid-style placeholder image (illustrative only — not official SUDA sheets)
UPDATE tp_schemes
SET
  raster_overlay_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Grid_floor_pattern.svg/512px-Grid_floor_pattern.svg.png',
  raster_opacity = 0.5
WHERE area_name IN ('Vesu', 'Adajan')
  AND is_published = true;

CREATE OR REPLACE FUNCTION get_map_tp_schemes()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    json_agg(row_to_json(t) ORDER BY t.sort_order),
    '[]'::json
  )
  FROM (
    SELECT
      id,
      scheme_number,
      name,
      status::text AS status,
      taluka,
      area_name,
      center_lat,
      center_lng,
      overlay_color,
      pdf_url,
      source_url,
      sort_order,
      raster_overlay_url,
      raster_opacity,
      ST_AsGeoJSON(boundary::geometry)::json AS boundary_geojson
    FROM tp_schemes
    WHERE is_published = true
  ) t;
$$;

DROP POLICY IF EXISTS "Admins update reports" ON reports;
CREATE POLICY "Admins update reports"
  ON reports FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());
