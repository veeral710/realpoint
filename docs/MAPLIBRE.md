# MapLibre + georeferenced TP tiles (Phase 3d)

Current app: **react-native-maps** (works in Expo Go).  
Target: **@maplibre/maplibre-react-native** with custom dev/production builds.

## Why a dev build?

MapLibre needs native code. It does **not** run in Expo Go. Use EAS `development` profile:

```bash
cd apps/mobile
eas build -p android --profile development
# install APK, then:
pnpm dev   # Metro connects to dev client
```

## Implementation outline

1. **Install** (after dev client workflow is ready):
   ```bash
   pnpm add @maplibre/maplibre-react-native
   ```
   Add plugin to `app.json` per MapLibre Expo docs.

2. **Tile source** — store georeferenced tiles in Supabase Storage or CDN:
   - Upload XYZ/WebM tiles generated from official SUDA PDFs (GDAL/`gdal2tiles`, or QGIS)
   - Table `map_tile_sources`: `tp_scheme_id`, `url_template`, `bounds`, `min_zoom`, `max_zoom`

3. **Replace `SuratMap.tsx`** — MapLibre `MapView` + `RasterSource` / `ImageSource` for each scheme

4. **Opacity** — MapLibre layer `raster-opacity` per source (same UX as current sliders)

5. **3D** — `pitch` / `bearing` on camera (optional)

## Data pipeline (ops)

1. Obtain official TP/DP PDF from SUDA
2. Georeference in QGIS (GCP points)
3. Export tiles → bucket `map-tiles/{scheme_id}/{z}/{x}/{y}.png`
4. Register in admin CMS (future: `/admin/map-tiles`)

Until tiles exist, keep polygon overlays from PostGIS (`get_map_tp_schemes`).
