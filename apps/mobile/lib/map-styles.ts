import type { StyleSpecification } from "@maplibre/maplibre-react-native";

/** OpenStreetMap raster — works on device when HTTPS is available (preferred for local demo). */
export const MAP_STYLE_OSM: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

/** MapLibre demo style (needs fetch; can hang on some devices). */
export const MAP_STYLE_STREETS_URL =
  "https://demotiles.maplibre.org/style.json";

/** Esri World Imagery raster basemap (satellite/hybrid feel). */
export const MAP_STYLE_SATELLITE: StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    satellite: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Esri, Maxar, Earthstar Geographics",
    },
    labels: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
    },
  },
  layers: [
    { id: "satellite", type: "raster", source: "satellite" },
    {
      id: "labels",
      type: "raster",
      source: "labels",
      paint: { "raster-opacity": 0.7 },
    },
  ],
};
