#!/usr/bin/env bash
# Creates or updates local dev admin: admin@realpoint.local / realpoint123
set -euo pipefail
URL="${NEXT_PUBLIC_SUPABASE_URL:-http://127.0.0.1:54321}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU}"
EMAIL="admin@realpoint.local"
PASSWORD="realpoint123"

EXISTING=$(curl -s "$URL/auth/v1/admin/users?email=$EMAIL" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

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
