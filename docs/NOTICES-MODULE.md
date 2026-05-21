# Public notices module

Geo-tagged **news_items** power trust features without a separate table.

## Data model

`news_items` columns:

- `locality_id`, `tp_scheme_id` — link to Surat areas / TP schemes
- `latitude`, `longitude` — map pins and heatmap

Seeded posts are backfilled from area keywords in title/summary; city-wide items use Surat center.

## RPCs

| Function | Use |
|----------|-----|
| `get_map_notices()` | Planning map pins + heatmap (MapLibre) |
| `get_notices_for_scheme(uuid)` | TP scheme detail list (~8 km + same locality) |

## Mobile

| Screen | Behavior |
|--------|----------|
| **Map → Planning** | Toggle “Public notices”; heatmap + dots (MapLibre) or pins (legacy map) |
| **TP scheme detail** | “Public notices near this scheme” → News detail |
| **News tab** | Unchanged feed; same items |

## Admin

**News** form: locality, TP scheme, lat/lng optional fields.

## Local apply

```bash
supabase migration up   # includes 20250521000011_geo_news.sql
```

## Later (Path A / cloud)

- Push alerts for new notices in bookmarked localities
- Dedicated `public_notices` table only if news_items becomes too noisy
