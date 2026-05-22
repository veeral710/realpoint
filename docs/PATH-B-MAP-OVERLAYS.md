# Path B — Sample TP raster overlays (MapLibre)

Illustrative **georeferenced image sheets** on the Map tab — not official SUDA PDFs.

## How it works

- `tp_schemes.raster_overlay_url` + `raster_opacity` in the database
- MapLibre `ImageSource` aligns the image to scheme bounds (or center box)
- Toggle **Sample TP sheets** in Map → Planning layers (**dev build / MapLibre only**)
- Expo Go uses the legacy map (polygons only)

## Demo data

Migration `20250521000016_path_b_raster_overlays.sql` sets a grid placeholder image on **Vesu** and **Adajan** schemes.

## Try it

```bash
pnpm supabase:reset
# Dev APK + Metro — not Expo Go
```

1. Map → Planning  
2. Enable **Sample TP sheets**  
3. Zoom to Vesu or Adajan — semi-transparent grid appears over the zone  

## Production path

Replace `raster_overlay_url` with Supabase Storage URLs of georeferenced PNGs exported from real TP PDFs (corners from survey control points).
