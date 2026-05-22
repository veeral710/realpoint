#!/usr/bin/env bash
# Full local demo dataset: reset DB, seed users, seed listings.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Stopping is not required; running supabase db reset..."
supabase db reset

echo "==> Seeding auth users..."
bash scripts/seed-dev-admin.sh
bash scripts/seed-dev-users.sh

echo "==> Seeding listings (requires admin user)..."
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  -f supabase/migrations/20250521000006_seed_listings.sql -q

echo "==> Seeding M2 demo inquiries..."
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  -f scripts/seed-m2-demo.sql -q

echo ""
echo "Demo reset complete."
echo "  Web admin:  http://localhost:3000/login"
echo "  Email:      admin@realpoint.local / realpoint123"
echo "  Buyer app:  buyer@realpoint.local / realpoint123"
echo "  Counts:     run supabase db or check admin dashboard"
