# 5-minute RealPoint demo script

Use after `pnpm demo:reset`. Phone: dev APK or Expo Go (basic map). Admin: http://localhost:3000

**Logins:** `admin@realpoint.local` / `buyer@realpoint.local` / `agent@realpoint.local` — password `realpoint123`

---

## 0 — Setup (30 sec, presenter only)

```bash
pnpm supabase:start
pnpm demo:reset
pnpm dev:web
# Phone: bash scripts/dev-mobile-url.sh  OR  pnpm dev:mobile (Expo Go)
```

Say aloud: *“Everything you see is sample Surat data for product demo — not official government records.”*

---

## 1 — Admin credibility (1 min)

| Step | Screen | Say / show |
|------|--------|------------|
| 1.1 | http://localhost:3000/login → admin | “Back-office for editors and moderators.” |
| 1.2 | Dashboard | Point at news / listings / TP counts (~20+ each). |
| 1.3 | News → **Duplicate** one row | “We can spin up a circular in seconds during a demo.” |
| 1.4 | **7/12 requests** | “Homebuyers request revenue docs — stored locally, no govt API yet.” |
| 1.5 | **Inquiries** | “Buyer messages on listings — same table the seller sees in the app.” |
| 1.6 | **Load demo pack** (if counts look empty) | Refreshes demo inquiries without full DB reset. |

---

## 2 — Consumer: trust & planning (2 min)

| Step | Screen | Say / show |
|------|--------|------------|
| 2.1 | **News** tab | Filter **Vesu** or **Adajan** — “Area-aware government-style updates.” |
| 2.2 | Open one notice → **View on map** (if shown) | Links news to geography. |
| 2.3 | **Map → Planning** | Toggle **Notices**, **TP overlay** — legend colors are illustrative. |
| 2.4 | Tap a scheme → detail → **Notices for this scheme** | “Trust layer: what applies to this TP.” |
| 2.5 | **TP directory** | Search + status filter → open scheme → **Sample PDF** |

---

## 3 — Marketplace loop (1.5 min)

| Step | Screen | Say / show |
|------|--------|------------|
| 3.1 | **Properties** | Filters: rent / sell / land — “Classifieds with planning context.” |
| 3.2 | Open a listing → **Planning context** → map | “Not just price — which TP zone.” |
| 3.3 | Account → **Login as buyer** | `buyer@realpoint.local` |
| 3.4 | Same listing → **Send inquiry** | “Lead capture without WhatsApp Business API.” |
| 3.5 | Account → **Login as admin** (seller) → **Inquiries on my listings** | Seller inbox — 3 demo messages. |
| 3.6 | **Request 7/12** → submit → note `DEMO-…` ref | Show matching row in admin. |
| 3.7 | **WhatsApp** on listing (mock) | “Opens chat or demo alert — swappable later.” |

---

## 4 — M4 polish (optional, 1 min)

| Step | Screen | Show |
|------|--------|------|
| 4.1 | Onboarding (fresh install) or **Account → My areas** | Pick Vesu + Adajan |
| 4.2 | **News** tab | Badge on tab; filter pre-set to your area |
| 4.3 | Listing or news detail → **Report** | Admin → **Reports** queue |
| 4.4 | Account → **Gujarati content** | Tab titles switch to Gujarati |
| 4.5 | Admin → **Analytics** | Screen view counts after browsing app |

---

## 5 — Close (30 sec)

- **MapLibre / push:** need EAS dev build, not Expo Go.
- **Next real step:** one data partnership OR one production integration — not ten stubs at once.

---

## Troubleshooting (during demo)

| Issue | Fix |
|-------|-----|
| Red screen / no data | `pnpm supabase:start` + correct LAN URL in `apps/mobile/.env` |
| Map tab crash in Expo Go | Use `pnpm dev:mobile` after pull (lazy MapLibre); or dev APK |
| Empty inquiries | Admin → **Load demo pack** or `pnpm seed:m2` |
| “No usable data” QR | Expo Go: press `s` in Metro, or use dev APK + manual URL |

---

## Screenshot mode

Hide yellow demo banners on mobile:

```env
EXPO_PUBLIC_DEMO_MODE=clean
```

Restart Metro after changing `.env`.
