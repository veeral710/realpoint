# Start RealPoint locally

Run **one command per line**. Do not paste lines that start with `#`.

## Terminal 1 — database

```bash
cd /Users/beactinfotech/realpoint
pnpm supabase:start
```

Wait for: `supabase local development setup is running.`

## Terminal 2 — web app

```bash
cd /Users/beactinfotech/realpoint
pnpm dev:web
```

Open: http://localhost:3000/admin

**Login (local — email + password):**

```bash
bash scripts/seed-dev-admin.sh
```

Then http://localhost:3000/login → **Sign in**

- Email: `admin@realpoint.local`
- Password: `realpoint123`

(Phone OTP does not work locally without an SMS provider.)

**"Database error saving new user"** — fixed by profile trigger using `public.profiles`. If it returns, run:

```bash
pnpm supabase:reset
```

## Terminal 3 — mobile (optional)

Expo Go requires a **free** account (one-time):

```bash
npx expo login
```

Sign up at https://expo.dev/signup if needed, then:

```bash
cd /Users/beactinfotech/realpoint
pnpm dev:mobile
```

| Target | Command |
|--------|---------|
| iOS Simulator (easiest) | `pnpm --filter @realpoint/mobile dev:ios` |
| Android emulator | `pnpm --filter @realpoint/mobile dev:android` |
| Phone (Expo Go) | Scan QR after `pnpm dev:mobile` |

**Physical phone + Supabase:** edit `apps/mobile/.env` — use your Mac IP, not `127.0.0.1`:

```env
EXPO_PUBLIC_SUPABASE_URL=http://192.168.0.113:54321
```

(Use the IP shown in Metro, e.g. `exp://192.168.0.113:8082`)

**Android emulator:** use `http://10.0.2.2:54321`

Keep `pnpm supabase:start` running in another terminal.

**Expo Go SDK mismatch** — project uses **SDK 54** (matches current Expo Go). After upgrade, restart with cache clear:

```bash
cd /Users/beactinfotech/realpoint/apps/mobile
npx expo start --lan -c
```

## Stop database when done

```bash
pnpm supabase:stop
```
