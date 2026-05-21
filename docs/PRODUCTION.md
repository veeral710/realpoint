# Production — Supabase Cloud + EAS

## 1. Supabase Cloud

1. Create a project at https://supabase.com/dashboard
2. Link CLI: `supabase link --project-ref YOUR_REF`
3. Push schema: `supabase db push`
4. Set secrets in Dashboard → Settings → API:
   - `SUPABASE_URL`, `anon` key → `apps/mobile/.env` and `apps/web/.env.local`
5. Auth:
   - Enable **Phone** OTP (Twilio / MessageBird) for India
   - Or email magic link for early beta
6. Storage: confirm `listing-images` bucket policies match local migration
7. Run seeds manually or via SQL editor (news, localities, TP schemes — not dev-only admin user SQL in prod)

**Web admin env** (`apps/web/.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server only, never in mobile
ADMIN_EMAILS=you@yourdomain.com
```

**Mobile env** (`apps/mobile/.env` for EAS / production):

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Remove `EXPO_PUBLIC_SUPABASE_LAN_URL` in production builds.

## 2. EAS (Expo Application Services)

Prerequisites: Expo account, `npm i -g eas-cli`, `eas login`.

```bash
cd apps/mobile
eas init   # link to expo.dev project — update app.json extra.eas.projectId
```

### Build profiles (`eas.json`)

| Profile | Use |
|---------|-----|
| `development` | Dev client (MapLibre / native modules later) |
| `preview` | Internal APK / TestFlight |
| `production` | Store release |

```bash
# Android internal APK
eas build -p android --profile preview

# iOS TestFlight
eas build -p ios --profile preview
eas submit -p ios --profile production
```

Set EAS secrets for production env:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://...
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value eyJ...
```

## 3. Store checklist

- Privacy policy URL (web `/privacy` deployed on Vercel)
- Screenshots: News, Properties, **Map** tab with layers
- Package: `com.realpoint.surat` (already in `app.json`)
- Play: content rating, data safety form
- iOS: App Store Connect app record + TestFlight external testers

See [BETA_LAUNCH.md](./BETA_LAUNCH.md) for install targets and metrics.

## 4. MapLibre / georeferenced tiles

Expo Go uses `react-native-maps`. For Town-Plan-style georeferenced PDF tiles, use the **development** EAS profile and follow [MAPLIBRE.md](./MAPLIBRE.md).
