# Phase 1–2 validation checklist

Run with `pnpm supabase:start`, `pnpm dev:web`, `pnpm dev:mobile`.

Setup once:

```bash
pnpm seed:admin
pnpm supabase db reset   # or apply migration 20250521000006_seed_listings.sql
```

---

## Web admin

| # | Test | Pass? |
|---|------|-------|
| 1 | http://localhost:3000/login — email `admin@realpoint.local` / password `realpoint123` | ☐ |
| 2 | `/admin` dashboard loads | ☐ |
| 3 | `/admin/news` — list shows 12 seeded items | ☐ |
| 4 | Add news item → appears in list | ☐ |
| 5 | `/admin/listings` — shows 10+ sample listings | ☐ |
| 6 | Draft listing → **Publish** → status `published` | ☐ |
| 7 | Sign out works | ☐ |

---

## Mobile app (Expo)

Use **Expo Go on phone** or press **`i`** (iOS) / **`a`** (Android).  
Do **not** press **`w`** — that is a separate web bundle. Use `pnpm dev:web` for the admin site.

Set in `apps/mobile/.env` (IP from `exp://192.168.x.x:8082`):

```env
EXPO_PUBLIC_SUPABASE_LAN_URL=http://192.168.0.113:54321
```

Restart Expo after changing `.env`. Log must show that URL, not `127.0.0.1`.

---

## Mobile — news (no login required)

| # | Test | Pass? |
|---|------|-------|
| 8 | News tab loads articles | ☐ |
| 9 | Filter by category (SUDA, RERA, etc.) | ☐ |
| 10 | Open article → detail + share | ☐ |
| 11 | Disclaimer on first launch | ☐ |

---

## Mobile — login & saved

| # | Test | Pass? |
|---|------|-------|
| 12 | Account → Login → same email/password as web | ☐ |
| 13 | Save news item → Account → Saved | ☐ |
| 14 | Gujarati toggle on Account | ☐ |

---

## Mobile — listings

| # | Test | Pass? |
|---|------|-------|
| 15 | Properties tab shows published listings | ☐ |
| 16 | Filter by intent / property type | ☐ |
| 17 | Open listing → Call / WhatsApp / inquiry | ☐ |
| 18 | Post new listing (logged in) → photos optional | ☐ |
| 19 | New listing visible in web admin (draft or published) | ☐ |
| 20 | Admin publish → appears on mobile feed | ☐ |

---

## Known local limitations

- Phone OTP: disabled (use email/password)
- Push notifications: skipped in Expo Go
- Supabase on phone: set `EXPO_PUBLIC_SUPABASE_LAN_URL=http://YOUR_MAC_IP:54321` in `apps/mobile/.env` (see Metro line `exp://192.168.x.x:8082`)

---

## Goal

- [ ] 10–20 listings visible (seed + your own posts)
- [ ] No blocking crashes on news + listings flows
- [ ] Admin can moderate all user posts

When all critical rows (1–20) pass, proceed to **Phase 3: Maps** (`docs/` + TP scheme tables).
