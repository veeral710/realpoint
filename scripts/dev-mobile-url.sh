#!/usr/bin/env bash
# Start Metro for the RealPoint dev client and print the URL for your phone.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT=8082

IP="$(ipconfig getifaddr en0 2>/dev/null || true)"
if [[ -z "${IP}" ]]; then
  IP="$(ipconfig getifaddr en1 2>/dev/null || true)"
fi
if [[ -z "${IP}" ]]; then
  IP="YOUR_MAC_IP"
fi

echo ""
echo "=============================================="
echo "  RealPoint dev client — connect your phone"
echo "=============================================="
echo ""
echo "  1. Phone and Mac on the SAME Wi-Fi"
echo "  2. Open the RealPoint DEV app (APK from EAS)"
echo "     — NOT Expo Go"
echo "  3. Shake phone → Enter URL manually:"
echo ""
echo "       http://${IP}:${PORT}"
echo ""
echo "  4. Tap Reload"
echo ""
echo "  Supabase on phone (.env):"
echo "       EXPO_PUBLIC_SUPABASE_LAN_URL=http://${IP}:54321"
echo ""
echo "=============================================="
echo ""

# Free port so we always use 8082
if lsof -ti:"${PORT}" >/dev/null 2>&1; then
  echo "Stopping old process on port ${PORT}..."
  lsof -ti:"${PORT}" | xargs kill -9 2>/dev/null || true
  sleep 1
fi

cd "${ROOT}"
exec pnpm dev:mobile:client
