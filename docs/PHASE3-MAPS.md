# Phase 3 — Surat planning maps

## What's included

- **PostGIS** tables: `tp_schemes`, `villages`, `planning_overlays` (DP/FP), listing links
- **8 seeded TP schemes** + **2 DP** + **2 FP** + **2 villages** (approximate boundaries)
- **Mobile Map tab**: layer toggles (TP, DP, FP, village, properties), opacity sliders, collapsible panel
- **Property pins** on map with intent filter (sell / rent / buy); coordinates backfilled from TP/locality
- **TP directory**: search, scheme detail, open on map
- **Admin**: `/admin/tp-schemes` CRUD (metadata + center; boundaries via SQL for now)
- **Listings**: optional TP scheme on create; detail links to map

## Apply migrations

```bash
pnpm supabase:start   # if not running
pnpm supabase db reset   # or: supabase migration up
```

RPCs: `get_map_tp_schemes`, `get_map_planning_overlays`, `get_map_villages`, `get_map_listings`.

## Run mobile

```bash
pnpm dev:mobile
```

Open the **Map** tab. Use **TP directory** to search schemes.

On a physical device, ensure `EXPO_PUBLIC_SUPABASE_LAN_URL` is set in `apps/mobile/.env`.

## Next (Phase 3d+)

- Georeferenced PDF/tile pyramids (MapLibre custom dev build)
- Admin UI for DP/FP/village boundaries
- 3D pitch (MapLibre)
- Accurate listing GPS capture on post/create

## Note on accuracy

Overlay polygons are **indicative** for UX testing. Production should use official georeferenced sheets from SUDA / revenue records.
