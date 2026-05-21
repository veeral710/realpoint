# Map architecture — RealPoint vs Town Plan Map

Reference: [Town Plan Map](https://townplanmap.com/welcome)

## What Town Plan Map actually does

### One map canvas — but not one flat menu

They use a **single interactive map**, then split **capabilities** into product modules:

| Module | Role | Same map? |
|--------|------|-----------|
| **Planning map** | TP, DP, village **layers** toggled on one basemap | Yes — core canvas |
| **TP scheme directory** | Browse schemes, status, open scheme on map | Links *into* map |
| **Public notices** | Heatmap + searchable list | Map + **separate list module** |
| **Land exploration** | Listings with TP/DP context | Map pins + **listings UX** |
| **7/12 & property card** | Document request → WhatsApp | **Not** a map layer |
| **GPS map camera** | Geo-tagged photos | **Separate tool** |
| **City / RERA projects** | Project discovery | **Separate directories** |

**TP vs DP:** macro statutory vision (DP) vs micro parcel layout (TP). Often viewed together but understood as different data products.

**FP (final plot):** sheet-level detail **inside** a TP scheme — not usually a city-wide toggle like DP.

### How users work

1. Choose city (Surat for us)
2. Open **map** → toggle **planning layers** (TP, DP, village)
3. Use **directories** (TP list, projects) to jump into the map
4. Use **listings / land exploration** when buying/selling — with planning context
5. Use **news / notices** and **documents** outside the layer drawer

---

## What RealPoint does today (MVP)

Everything is in one **Map** tab drawer:

- Satellite, TP, DP, FP, Village, Properties — all equal toggles

That was fine for a **technical demo** of PostGIS + pins, but it mixes:

- **Planning intelligence layers** (TP, DP, village; FP per-scheme later)
- **Marketplace** (published listings)
- **Future modules** we have not built (7/12, RERA, notices heatmap)

Your screenshot (Apple Maps fallback + property pin) shows **listings on the map work**; the UX question is whether they belong in the same control panel as TP/DP.

---

## Recommended structure (Surat-first)

### Keep on one map (layers)

- Basemap: satellite / street
- **TP overlay** (primary for Surat)
- **DP overlay** (optional, macro zoning)
- **Village overlay** (peri-urban / revenue context)

### Move off the global layer drawer

| Item | Where it should live |
|------|----------------------|
| **FP sheets** | TP scheme detail → “View FP / sheet” (per scheme), not global toggle |
| **Properties** | **Properties** tab primary; map = “Planning map” with optional “Show listings” or open from listing detail |
| **TP directory** | Already `/maps/directory` — keep as entry to map |
| **News / SUDA notices** | **News** tab (already separate) |
| **7/12, RERA, projects** | Future tabs or hub — not map toggles |

### Map tab modes (UI)

```
[ Planning ]  [ Listings on map ]
```

- **Planning:** TP + DP + village + opacity (Town Plan style)
- **Listings on map:** pins + intent filter only; lighter layer set

Or keep one map but **group** the panel:

1. Basemap  
2. Planning layers (TP, DP, village)  
3. Marketplace (properties) — labelled as listings, not “FP”

---

## Module roadmap (aligned with Town Plan Map)

| Phase | Module | Tab / route |
|-------|--------|-------------|
| Done | Govt news | News |
| Done | Listings | Properties |
| Done | TP directory + map | Map + `/maps/directory` |
| Now | Planning map layers | Map (TP/DP/village) |
| Done | FP per TP scheme | Scheme detail + map `showFp` |
| Later | Public notice heatmap | See [NOTICES-MODULE.md](./NOTICES-MODULE.md) |
| Later | 7/12 request | Account / listing detail |
| Later | RERA / city projects | New “Projects” section |

---

## Summary

- **Yes**, TP / DP / village belong on the **same planning map** (Town Plan Map does this).
- **No**, not everything should be one flat list of switches — **listings**, **FP**, **documents**, and **notices** are **different features** that *use* the map, not equivalent layers.
- RealPoint should evolve from “demo toggles” → **Planning map** + **separate modules** linked into the map.
