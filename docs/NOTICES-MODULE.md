# Public notices module (planned)

Aligned with [Town Plan Map — Public Notice Intelligence](https://townplanmap.com/welcome).

## Purpose

Track SUDA / revenue / RERA **public notices** spatially — not as a map layer toggle mixed with TP/DP.

## User flows

1. **News tab** (current) — curated circulars with source links (Phase 1).
2. **Notices map module** (future) — heatmap of notice density by area.
3. **Notices list** (future) — searchable by date, authority, linked locality/TP scheme.

## Data model (draft)

```sql
public_notices (
  id, title, summary, authority, category,
  published_at, source_url, pdf_url,
  locality_id, tp_scheme_id,
  center_lat, center_lng,
  is_published
)
```

## UI placement

| Surface | Role |
|---------|------|
| News tab | Text-first circulars (keep) |
| Map → separate entry | “Planning notices” heatmap (optional chip on Planning mode) |
| TP scheme detail | Related notices for that scheme |

## Build order

1. Extend `news_items` with optional `latitude`, `longitude`, `tp_scheme_id` for geo notices.
2. Map heatmap layer (MapLibre / legacy) driven by notice points.
3. Filter list on News tab: “Map view” / “Near this scheme”.
4. Push alerts (Expo notifications) for new notices in saved localities.

## Out of scope for v1

- Automated scraping of govt portals (manual CMS first).
- Legal certification of notice text.
