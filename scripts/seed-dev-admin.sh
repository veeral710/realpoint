#!/usr/bin/env bash
# Creates or updates local dev admin: admin@realpoint.local / realpoint123
set -euo pipefail
URL="${NEXT_PUBLIC_SUPABASE_URL:-http://127.0.0.1:54321}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU}"
EMAIL="admin@realpoint.local"
PASSWORD="realpoint123"

auth_user_id() {
  python3 - "$1" "$URL" "$SERVICE_KEY" <<'PY'
import json, sys, urllib.request
email, url, key = sys.argv[1], sys.argv[2], sys.argv[3]
req = urllib.request.Request(
    f"{url}/auth/v1/admin/users?page=1&per_page=200",
    headers={"apikey": key, "Authorization": f"Bearer {key}"},
)
with urllib.request.urlopen(req) as r:
    data = json.load(r)
for u in data.get("users", []):
    if u.get("email") == email:
        print(u["id"])
        break
PY
}

EXISTING=$(auth_user_id "$EMAIL" || true)

if [ -n "$EXISTING" ]; then
  curl -s -X PUT "$URL/auth/v1/admin/users/$EXISTING" \
    -H "apikey: $SERVICE_KEY" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"password\":\"$PASSWORD\",\"email_confirm\":true}" > /dev/null
  echo "Updated user $EMAIL"
else
  curl -s -X POST "$URL/auth/v1/admin/users" \
    -H "apikey: $SERVICE_KEY" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"email_confirm\":true}" > /dev/null
  echo "Created user $EMAIL"
fi

PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -q -c \
  "UPDATE profiles SET is_admin = true WHERE id IN (SELECT id FROM auth.users WHERE email = '$EMAIL');"

echo ""
echo "Login: http://localhost:3000/login"
echo "Email:    $EMAIL"
echo "Password: $PASSWORD"
