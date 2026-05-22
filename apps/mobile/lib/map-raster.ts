import type { TpSchemeMap } from "@realpoint/shared";

/** Four corners for MapLibre ImageSource: NW, NE, SE, SW as [lng, lat]. */
export function rasterCoordinatesForScheme(
  scheme: TpSchemeMap,
  delta = 0.014
): [[number, number], [number, number], [number, number], [number, number]] {
  const bbox = bboxFromBoundary(scheme.boundary_geojson);
  if (bbox) {
    const [west, south, east, north] = bbox;
    return [
      [west, north],
      [east, north],
      [east, south],
      [west, south],
    ];
  }

  const lat = scheme.center_lat;
  const lng = scheme.center_lng;
  return [
    [lng - delta, lat + delta],
    [lng + delta, lat + delta],
    [lng + delta, lat - delta],
    [lng - delta, lat - delta],
  ];
}

function bboxFromBoundary(
  geo: TpSchemeMap["boundary_geojson"]
): [number, number, number, number] | null {
  if (!geo?.coordinates?.[0]?.length) return null;
  const ring = geo.coordinates[0];
  let west = Infinity;
  let east = -Infinity;
  let south = Infinity;
  let north = -Infinity;
  for (const [lng, lat] of ring) {
    if (lng < west) west = lng;
    if (lng > east) east = lng;
    if (lat < south) south = lat;
    if (lat > north) north = lat;
  }
  if (!Number.isFinite(west)) return null;
  return [west, south, east, north];
}

export function schemesWithRaster(
  schemes: TpSchemeMap[],
  selectedSchemeId?: string | null
): TpSchemeMap[] {
  return schemes.filter(
    (s) =>
      s.raster_overlay_url &&
      (!selectedSchemeId || s.id === selectedSchemeId)
  );
}
