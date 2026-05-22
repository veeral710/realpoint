# M4 — Polish (Gujarati, onboarding, reports)

## Features

| # | Feature | Where |
|---|---------|--------|
| 4.1 | Area onboarding (step 2) | First launch → pick Vesu, Adajan, … |
| 4.2 | News tab badge + saved alerts | Tab badge = recent news in your areas |
| 4.3 | Report listing / news | Detail screens → Report → admin queue |
| 4.4 | Gujarati UI | Account toggle; tab + map + intent labels |
| 4.5 | Analytics events | Admin → Analytics (last 7 days) |

## Database

```bash
pnpm supabase:reset   # applies 20250521000015_m4_polish.sql
```

Adds:

- `profiles.area_interests`, `profiles.onboarding_completed_at`
- `reports.news_item_id`, `reports.status`
- `analytics_events` table
- Gujarati backfill on demo `news_items`

## Mobile

- **Onboarding:** disclaimer → pick areas (optional skip)
- **Account → My areas:** change filters later
- **News:** defaults to first saved area; tab badge for new notices
- **Saved:** “New in your areas” summary
- **Gujarati:** Account switch updates tab titles on next tab focus
- **Report:** listing + news detail

## Admin

- `/admin/reports` — moderation queue
- `/admin/analytics` — `screen_view`, `map_open` counts

## Screenshot mode

Still uses `EXPO_PUBLIC_DEMO_MODE=clean` from M3 (hides demo banner).

## Not in M4

Static map PNG overlays (Path B) — deferred to a later phase.
