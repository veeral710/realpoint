-- Phase 3: Maps — PostGIS, TP schemes, villages

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE tp_scheme_status AS ENUM ('draft', 'final', 'proposed', 'superseded');
CREATE TYPE map_layer_type AS ENUM ('tp', 'dp', 'fp', 'village');

CREATE TABLE villages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district TEXT NOT NULL DEFAULT 'Surat',
  taluka TEXT,
  name TEXT NOT NULL,
  name_gu TEXT,
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  boundary GEOGRAPHY(Polygon, 4326),
  source_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tp_schemes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheme_number TEXT NOT NULL,
  name TEXT NOT NULL,
  name_gu TEXT,
  status tp_scheme_status NOT NULL DEFAULT 'final',
  authority TEXT NOT NULL DEFAULT 'SUDA',
  district TEXT NOT NULL DEFAULT 'Surat',
  taluka TEXT,
  area_name TEXT,
  locality_id UUID REFERENCES localities(id),
  description TEXT,
  source_url TEXT,
  pdf_url TEXT,
  center_lat DOUBLE PRECISION NOT NULL,
  center_lng DOUBLE PRECISION NOT NULL,
  boundary GEOGRAPHY(Polygon, 4326),
  overlay_color TEXT DEFAULT '#1b6b4a',
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tp_schemes_district ON tp_schemes(district, is_published);
CREATE INDEX idx_tp_schemes_number ON tp_schemes(scheme_number);
CREATE INDEX idx_tp_schemes_boundary ON tp_schemes USING GIST (boundary);
CREATE INDEX idx_villages_boundary ON villages USING GIST (boundary);

ALTER TABLE listings ADD COLUMN IF NOT EXISTS tp_scheme_id UUID REFERENCES tp_schemes(id);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS village_id UUID REFERENCES villages(id);

CREATE TRIGGER tp_schemes_updated_at BEFORE UPDATE ON tp_schemes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_schemes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published villages are public"
  ON villages FOR SELECT TO anon, authenticated
  USING (is_published = true OR is_admin());

CREATE POLICY "Admins manage villages"
  ON villages FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Published TP schemes are public"
  ON tp_schemes FOR SELECT TO anon, authenticated
  USING (is_published = true OR is_admin());

CREATE POLICY "Admins manage TP schemes"
  ON tp_schemes FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- GeoJSON-friendly view for map clients
CREATE OR REPLACE VIEW tp_schemes_geojson AS
SELECT
  id,
  scheme_number,
  name,
  status,
  authority,
  taluka,
  area_name,
  center_lat,
  center_lng,
  overlay_color,
  pdf_url,
  source_url,
  ST_AsGeoJSON(boundary::geometry)::json AS boundary_geojson
FROM tp_schemes
WHERE is_published = true AND boundary IS NOT NULL;

GRANT SELECT ON tp_schemes_geojson TO anon, authenticated;

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
      ST_AsGeoJSON(boundary::geometry)::json AS boundary_geojson
    FROM tp_schemes
    WHERE is_published = true
  ) t;
$$;

GRANT EXECUTE ON FUNCTION get_map_tp_schemes() TO anon, authenticated;
