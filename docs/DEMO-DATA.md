# Demo data (mock-first)

All seeded content is **illustrative** for Surat UX testing — not from SUDA, RERA, or live markets.

**5-minute demo walkthrough:** [DEMO-SCRIPT.md](./DEMO-SCRIPT.md)

## Reset everything

```bash
pnpm demo:reset
```

This runs:

1. `supabase db reset` (migrations + SQL seeds)
2. `scripts/seed-dev-admin.sh` (creates admin — needs Python 3)
3. `scripts/seed-dev-users.sh` (buyer + agent)
4. Listing seed SQL (needs admin user; migration `06` skips on reset until step 2–3 run)

If step 2 fails with no output, run `bash scripts/seed-dev-admin.sh` alone and check Supabase is up (`pnpm supabase:status`).

## Demo logins

| Email | Password | Role |
|-------|----------|------|
| `admin@realpoint.local` | `realpoint123` | Admin (web + app) |
| `buyer@realpoint.local` | `realpoint123` | Buyer |
| `agent@realpoint.local` | `realpoint123` | Agent |

## What gets seeded

| Table | Source |
|-------|--------|
| `localities` | `20250521000002_seed_surat.sql` |
| `news_items` | `02` + `12_m1_demo_pack` (`[Demo]` prefix, geo) |
| `tp_schemes` | `08` + `12` (15 schemes) |
| `planning_overlays` | `09`, `10` |
| `listings` | `06` after admin user (+ geo link in `12`) |

## Rules

- Titles use **`[Demo]`** prefix after migration `12`.
- `is_demo = true` on news, listings, TP schemes.
- Map overlays are **approximate polygons**, not survey-accurate.
- Source URLs point to `example.com/demo/...` for new rows.

## Partial refresh (without full reset)

```bash
pnpm seed:admin
pnpm seed:users
pnpm seed:listings
```

## Mobile env

| Target | Supabase URL |
|--------|----------------|
| Android emulator | `http://10.0.2.2:54321` |
| Physical phone | `http://YOUR_MAC_IP:54321` (match `dev-mobile-url.sh` output) |

### Map tab not loading

1. Phone must have **internet** (MapLibre loads OpenStreetMap tiles).
2. Reload app after Metro restart (`r` in terminal).
3. Yellow banner **"MapLibre not in this APK"** → rebuild EAS dev client.
4. Stuck on **"Loading map…"** → app auto-falls back after ~8s; or set `EXPO_PUBLIC_FORCE_LEGACY_MAP=1` in `apps/mobile/.env` and restart Metro.
5. Panel shows **Supabase error** → fix `EXPO_PUBLIC_SUPABASE_LAN_URL` to your Mac IP (`:54321`).
