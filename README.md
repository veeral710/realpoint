# RealPoint — Surat Real Estate

Surat-focused real estate app: government news & circulars, property listings (buy/sell/rent), and admin CMS.

## Stack

- **Mobile:** Expo (React Native) + TypeScript — `apps/mobile`
- **Admin / web:** Next.js 15 — `apps/web`
- **Shared types:** Zod schemas — `packages/shared`
- **Backend:** Supabase (Postgres, Auth, Storage, RLS)

## Prerequisites

- Node.js 20+
- pnpm 9+
- [Docker](https://www.docker.com/) (running)
- [Supabase CLI](https://supabase.com/docs/guides/cli) — `brew install supabase/tap/supabase`
- [Expo](https://expo.dev) account (for EAS builds, optional for local dev)

## Setup — local Supabase in Docker (recommended)

This runs **Postgres + Auth + Storage** in Docker on your machine. No cloud project required for development.

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start Supabase (first run pulls Docker images)

```bash
pnpm supabase:start
```

Migrations in `supabase/migrations/` are applied automatically on first start.

Useful commands:

| Command | Purpose |
|---------|---------|
| `pnpm supabase:status` | URLs and API keys |
| `pnpm env:local` | Print ready-to-paste `.env` lines |
| `pnpm supabase:reset` | Reset DB and re-run migrations + seed |
| `pnpm supabase:stop` | Stop Docker containers |

- **Studio (DB UI):** http://127.0.0.1:54323  
- **API:** http://127.0.0.1:54321  
- **Postgres:** `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

### 3. Environment variables

```bash
pnpm env:local   # after supabase is running
```

Copy the output into:

```bash
# root (optional)
cp .env.local.example .env   # then paste keys from pnpm env:local

# required for apps
# apps/web/.env.local
# apps/mobile/.env
```

**Local phone login (no SMS provider):** test OTP is configured in `supabase/config.toml`:

- Phone: `9876543210` or `+919876543210`
- OTP: `123456`

If you see `WARN: no SMS provider is enabled`, upgrade the CLI (`brew upgrade supabase`) and run `pnpm supabase:stop && pnpm supabase:start`. Test OTP should still work on many CLI versions despite the warning.

Set `ADMIN_PHONE_NUMBERS=+919876543210` for web admin access.

**Android emulator:** use `EXPO_PUBLIC_SUPABASE_URL=http://10.0.2.2:54321` instead of `127.0.0.1`.

**Physical device on same Wi‑Fi:** use your Mac’s LAN IP, e.g. `http://192.168.1.x:54321`.

### 4. Run apps

```bash
pnpm dev:web      # http://localhost:3000 — admin at /admin
pnpm dev:mobile   # Expo — scan QR or press i/a
```

### 5. Promote admin (optional)

After first login, in Studio SQL editor:

```sql
UPDATE profiles SET is_admin = true WHERE phone = '+919876543210';
```

---

## Setup — Supabase Cloud (production)

For deployed apps, create a project at [supabase.com](https://supabase.com), then:

```bash
cp .env.example .env
# fill cloud URL and keys from Project Settings → API
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Enable **Phone** auth and configure an SMS provider (Twilio, etc.) — test OTP does not apply in cloud.

### Promote your admin user (cloud)

After first phone login:

```sql
UPDATE profiles SET is_admin = true WHERE phone = '+91YOURNUMBER';
```

Or add your number to `ADMIN_PHONE_NUMBERS` in `.env` (web admin layout checks both).

## Development

```bash
# Web admin + landing (port 3000)
pnpm dev:web

# Expo mobile
pnpm dev:mobile
```

## Project structure

```
apps/mobile/     Expo app (news, listings, auth, bookmarks, push)
apps/web/        Next.js landing + admin CMS
packages/shared/ Zod schemas & constants
supabase/        Migrations & seed data (Surat localities + news)
```

## Beta launch (Play Store & TestFlight)

### EAS Build

1. Install EAS CLI: `npm i -g eas-cli`
2. Login: `eas login`
3. Configure project ID in `apps/mobile/app.json` → `extra.eas.projectId`
4. Build:

```bash
cd apps/mobile
eas build --profile preview --platform all
```

### Play Store (internal testing)

1. Create app in [Google Play Console](https://play.google.com/console)
2. Package name: `com.realpoint.surat`
3. Upload AAB from EAS build
4. Add privacy policy URL (host `apps/web` disclaimer page or static page)
5. Target: **500 installs in Surat** — use internal testing track first

### TestFlight

1. Register bundle ID `com.realpoint.surat` in Apple Developer
2. Update `eas.json` submit section with Apple ID / ASC App ID
3. `eas submit --platform ios`

### Stability targets

- Crash rate &lt; 1% (monitor via Expo / Sentry if added later)
- Test OTP login on real devices before wide release

## Legal disclaimer

RealPoint is **not** affiliated with any government body. News and records are curated from public sources; users must verify independently before transacting.

## License

Private — Verity / RealPoint project.
