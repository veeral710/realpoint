export const DISTRICT_SURAT = "Surat";

export const NEWS_CATEGORIES = [
  "suda",
  "revenue",
  "rera",
  "gst_registration",
  "infrastructure",
  "general",
] as const;

export const NEWS_CATEGORY_LABELS: Record<
  (typeof NEWS_CATEGORIES)[number],
  string
> = {
  suda: "SUDA / Urban Planning",
  revenue: "Revenue",
  rera: "RERA",
  gst_registration: "GST & Registration",
  infrastructure: "Infrastructure",
  general: "General",
};

export const USER_ROLES = ["buyer", "seller", "agent"] as const;

export const LISTING_INTENTS = ["buy", "sell", "rent"] as const;

export const PROPERTY_CLASSES = [
  "agricultural",
  "non_agricultural",
  "plot",
  "house",
  "apartment",
  "commercial",
  "industrial",
  "mixed",
] as const;

export const PROPERTY_CLASS_LABELS: Record<
  (typeof PROPERTY_CLASSES)[number],
  string
> = {
  agricultural: "Agricultural Land",
  non_agricultural: "Non-Agricultural Land",
  plot: "Plot",
  house: "House",
  apartment: "Apartment",
  commercial: "Commercial",
  industrial: "Industrial",
  mixed: "Mixed Use",
};

export const AREA_UNITS = [
  "sqft",
  "sqm",
  "sqyd",
  "acre",
  "hectare",
  "guntha",
  "vigha",
] as const;

export const TP_SCHEME_STATUSES = [
  "draft",
  "final",
  "proposed",
  "superseded",
] as const;

export const TP_SCHEME_STATUS_LABELS: Record<
  (typeof TP_SCHEME_STATUSES)[number],
  string
> = {
  draft: "Draft",
  final: "Final",
  proposed: "Proposed",
  superseded: "Superseded",
};

export const MAP_LAYER_TYPES = ["tp", "dp", "fp", "village"] as const;

export const SURAT_MAP_CENTER = {
  latitude: 21.1702,
  longitude: 72.8311,
  latitudeDelta: 0.35,
  longitudeDelta: 0.35,
} as const;

export const MAP_LAYER_LABELS: Record<
  (typeof MAP_LAYER_TYPES)[number],
  string
> = {
  tp: "Town Planning (TP)",
  dp: "Development Plan (DP)",
  fp: "Final Plot (FP)",
  village: "Village",
};

export const MAP_DISCLAIMER =
  "Map overlays are approximate for reference. Verify boundaries and plot numbers with official SUDA / revenue records before any transaction.";

export const DISCLAIMER_TEXT =
  "RealPoint is not affiliated with any government body. Information is for reference only. Verify all details independently before any transaction. We are not responsible for losses from use of this app.";
