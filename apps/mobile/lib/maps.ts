import type { TpSchemeMap, MapOverlay, VillageMap } from "@realpoint/shared";

export type LatLng = { latitude: number; longitude: number };

export type MapPolygon = {
  id: string;
  name: string;
  label?: string;
  coordinates: LatLng[];
  fillColor: string;
  strokeColor: string;
};

type GeoBoundary = { coordinates?: number[][][] } | null | undefined;

export function hexWithAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${normalized}${a}`;
}

export function geoJsonPolygonToCoords(geojson: GeoBoundary): LatLng[] {
  if (!geojson?.coordinates?.[0]?.length) return [];
  return geojson.coordinates[0].map(([lng, lat]) => ({
    latitude: lat,
    longitude: lng,
  }));
}

function itemsToPolygons(
  items: {
    id: string;
    name: string;
    label?: string;
    boundary_geojson?: GeoBoundary;
    overlay_color?: string | null;
  }[],
  opacity: number,
  defaultColor: string
): MapPolygon[] {
  const polygons: MapPolygon[] = [];
  for (const item of items) {
    const coordinates = geoJsonPolygonToCoords(item.boundary_geojson);
    if (coordinates.length < 3) continue;
    const base = item.overlay_color ?? defaultColor;
    polygons.push({
      id: item.id,
      name: item.name,
      label: item.label,
      coordinates,
      fillColor: hexWithAlpha(base, opacity),
      strokeColor: base,
    });
  }
  return polygons;
}

export function tpSchemesToPolygons(
  schemes: TpSchemeMap[],
  opacity: number
): MapPolygon[] {
  return itemsToPolygons(
    schemes.map((s) => ({
      id: s.id,
      name: s.name,
      label: s.scheme_number,
      boundary_geojson: s.boundary_geojson,
      overlay_color: s.overlay_color,
    })),
    opacity,
    "#1b6b4a"
  );
}

export function overlaysToPolygons(
  overlays: MapOverlay[],
  opacity: number
): MapPolygon[] {
  return itemsToPolygons(
    overlays.map((o) => ({
      id: o.id,
      name: o.name,
      label: o.code,
      boundary_geojson: o.boundary_geojson,
      overlay_color: o.overlay_color,
    })),
    opacity,
    "#1565c0"
  );
}

export function villagesToPolygons(
  villages: VillageMap[],
  opacity: number
): MapPolygon[] {
  return itemsToPolygons(
    villages.map((v) => ({
      id: v.id,
      name: v.name,
      boundary_geojson: v.boundary_geojson,
      overlay_color: v.overlay_color ?? "#7b1fa2",
    })),
    opacity,
    "#7b1fa2"
  );
}

export function intentPinColor(intent: string): string {
  switch (intent) {
    case "sell":
      return "#1b6b4a";
    case "rent":
      return "#1565c0";
    case "buy":
      return "#e65100";
    default:
      return "#5c6b62";
  }
}
