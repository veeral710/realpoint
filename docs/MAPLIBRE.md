# MapLibre (RealPoint)

RealPoint uses **MapLibre** in dev/production builds and falls back to **react-native-maps** in **Expo Go**.

## Quick start (MapLibre)

### 1. Install & prebuild (once)

```bash
cd /Users/beactinfotech/realpoint
pnpm install
cd apps/mobile
npx expo prebuild   # optional locally; EAS Build runs this automatically
```

### 2. Create a development build

```bash
cd apps/mobile
eas login
eas init   # set projectId in app.json extra.eas.projectId
eas build -p android --profile development
# or iOS:
eas build -p ios --profile development
```

Install the APK/IPA on your device.

### 3. Start Metro for the dev client

```bash
cd /Users/beactinfotech/realpoint
pnpm dev:mobile:client
```

Open the **RealPoint** dev app (not Expo Go) and scan/connect to Metro.

## What you get with MapLibre

- Esri **satellite** basemap + street labels
- TP / DP / FP / village **GeoJSON overlays** (same data as before)
- **Property pins** as map circles
- Ready for **georeferenced raster tiles** (XYZ) per TP scheme later

## Expo Go

`pnpm dev:mobile` still works in Expo Go with the legacy map + a yellow banner on the Map tab.

## Georeferenced TP tiles (next)

1. Georeference official SUDA PDFs → tile pyramid (GDAL / QGIS)
2. Upload to Supabase Storage: `map-tiles/{scheme_id}/{z}/{x}/{y}.png`
3. Add `RasterSource` in `SuratMapLibre.tsx` per scheme
4. Opacity via `raster-opacity` (same sliders as today)

Table sketch (future migration):

```sql
map_tile_sources (tp_scheme_id, url_template, min_zoom, max_zoom, bounds)
```

## Files

| File | Role |
|------|------|
| `components/SuratMapLibre.tsx` | MapLibre map |
| `components/SuratMapLegacy.tsx` | Expo Go fallback |
| `lib/map-styles.ts` | Street + satellite styles |
| `lib/map-engine.ts` | Expo Go detection |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank map | Device online (satellite tiles need network) |
| Still basic map | You opened **Expo Go** — use the **dev build** |
| Build fails | `newArchEnabled: true` required (already set) |
| iOS pods | Run `eas build` or `npx expo prebuild` + `pod install` |
