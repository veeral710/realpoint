# First-time MapLibre dev build test

Use this checklist in order. Stop when a step fails and fix that step before continuing.

You need **two things** at once:

1. **Metro** (JavaScript bundler) running on your Mac  
2. **RealPoint dev app** (the APK from `eas build --profile development`) — **not Expo Go**

`adb` and Android Studio are **optional**. Wi‑Fi is enough.

---

## Step 0 — Dev APK (must include MapLibre)

If the Map tab is **blank** or the banner says **“MapLibre not in this APK”**, rebuild **after** pulling the latest code:

```bash
cd /Users/beactinfotech/realpoint/apps/mobile
eas login          # once
eas init           # once — links Expo project (fixes "Invalid UUID appId")
eas build -p android --profile development
```

If you see **Invalid UUID appId**, remove a fake `projectId` like `your-eas-project-id` from `app.json` and run `eas init` again.

Install the new APK on your Android phone.

Until you rebuild, the app still uses **react-native-maps** (standard map) — overlays should work after Metro connects.

---

## Step 1 — Clean start Metro (Mac)

Close any old Metro terminals. Then:

```bash
cd /Users/beactinfotech/realpoint
bash scripts/dev-mobile-url.sh
```

That script:

- Frees port **8082**
- Prints the URL to type on your phone
- Starts `pnpm dev:mobile:client`

Leave this terminal **open**. You should see `Metro waiting on...` and a QR code.

---

## Step 2 — Same Wi‑Fi

- Mac and phone on the **same home Wi‑Fi**
- Avoid guest networks / VPN on either device
- Mac firewall: allow incoming for Node/Terminal if prompted

---

## Step 3 — Connect the dev app (phone)

1. Open the app named **RealPoint** (your dev build), **not** “Expo Go”.
2. If you see a red error screen, shake the phone (or press menu).
3. Tap **Enter URL manually** (or “Configure bundler”).
4. Type **exactly** what the script printed, e.g.:

   `http://192.168.1.42:8082`

   Rules:

   - Use `http://` (not `https://`)
   - Use your Mac’s **LAN IP** (not `127.0.0.1` or `localhost`)
   - Port must match Metro (**8082** if you used the script)

5. Tap **Connect** / **Reload**.

**Success:** App loads past the red screen → you see News / Map tabs.  
**Map tab:** No yellow “Expo Go” banner = MapLibre is active.

You can also scan the QR in the Metro terminal **from inside the dev app** (not the system camera / Expo Go).

**Ignore** red `Web Bundling failed` / `react-native-maps` errors in the terminal — do not press `w` (web). Use the phone only.

---

## Step 4 — Verify MapLibre (optional)

On the **Map** tab:

- Toggle **Satellite** → basemap changes  
- Toggle **TP overlay** → green zones appear  
- Toggle **Properties** → pins appear  

If the yellow banner says “Expo Go uses the basic map”, you opened **Expo Go** by mistake, not the dev APK.

---

## Step 5 — Supabase (separate from Metro)

Metro only loads JavaScript. Data still needs Supabase.

```bash
# Another terminal
cd /Users/beactinfotech/realpoint
pnpm supabase:start
```

On a **physical phone**, `apps/mobile/.env` should include:

```env
EXPO_PUBLIC_SUPABASE_LAN_URL=http://YOUR_MAC_IP:54321
```

(`YOUR_MAC_IP` = same IP as Metro, port **54321** for Supabase.)

Reload the app after changing `.env` (restart Metro once).

---

## Quick tests from Mac

Replace `192.168.1.42` with your IP from the script.

```bash
# Metro reachable?
curl -s "http://192.168.1.42:8082/status" | head -c 200

# Supabase reachable?
curl -s "http://192.168.1.42:54321/rest/v1/" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" | head -c 100
```

If these fail from Mac using the LAN IP, the phone will fail too.

---

## Still stuck?

| Symptom | Fix |
|---------|-----|
| Red “Unable to load script” | Metro not running or wrong URL/port on phone |
| `adb: no devices` | Ignore adb; use Wi‑Fi URL above |
| Port 8083 vs 8082 | Use the port Metro actually shows; prefer `dev-mobile-url.sh` (8082) |
| Yellow Expo Go banner on Map | Wrong app — open dev APK |
| News works, map empty / errors | Run `pnpm supabase:start` + fix `.env` LAN URL |
| Want to skip MapLibre for now | `pnpm dev:mobile` + **Expo Go** (basic map only) |

---

## Easiest fallback (no dev build)

```bash
pnpm install
pnpm supabase:start
pnpm dev:mobile
```

Scan QR with **Expo Go** — everything except MapLibre works; Map tab uses the basic map.
