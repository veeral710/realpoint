#!/usr/bin/env bash
# Start local Supabase + Metro for Android emulator (10.0.2.2).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

echo ""
echo "=============================================="
echo "  RealPoint — Android emulator demo"
echo "=============================================="
echo ""
echo "  1. Open Android Studio → Device Manager → start an emulator"
echo "  2. In apps/mobile/.env set:"
echo ""
echo "       EXPO_PUBLIC_SUPABASE_LAN_URL=http://10.0.2.2:54321"
echo ""
echo "  3. In the emulator Expo/dev app, connect to Metro (press 'a' in Metro or open app)"
echo ""
echo "  Full walkthrough: docs/DEMO-SCRIPT.md"
echo "=============================================="
echo ""

if ! command -v supabase >/dev/null 2>&1; then
  echo "supabase CLI not found. Install: https://supabase.com/docs/guides/cli"
  exit 1
fi

if ! supabase status >/dev/null 2>&1; then
  echo "==> Starting Supabase..."
  pnpm supabase:start
else
  echo "==> Supabase already running"
fi

PORT=8082
if lsof -ti:"${PORT}" >/dev/null 2>&1; then
  echo "Stopping old Metro on :${PORT}..."
  lsof -ti:"${PORT}" | xargs kill -9 2>/dev/null || true
  sleep 1
fi

cd "${ROOT}/apps/mobile"
exec node ../../node_modules/expo/bin/cli start --lan --port "${PORT}"
