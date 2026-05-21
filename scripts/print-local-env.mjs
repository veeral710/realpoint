#!/usr/bin/env node
/**
 * Prints .env lines from `supabase status -o env` for copy-paste.
 * Usage: pnpm supabase:status && pnpm env:local
 */
import { execSync } from "node:child_process";

try {
  const out = execSync("supabase status -o env", {
    encoding: "utf8",
    cwd: new URL("..", import.meta.url).pathname,
  });
  const vars = Object.fromEntries(
    out
      .split("\n")
      .filter((l) => l.includes("="))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")];
      })
  );

  const url = vars.API_URL ?? "http://127.0.0.1:54321";
  const anon = vars.ANON_KEY ?? "";
  const service = vars.SERVICE_ROLE_KEY ?? "";

  console.log(`
# Paste into .env, apps/web/.env.local, and apps/mobile/.env

NEXT_PUBLIC_SUPABASE_URL=${url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon}
EXPO_PUBLIC_SUPABASE_URL=${url}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${anon}
SUPABASE_SERVICE_ROLE_KEY=${service}
ADMIN_PHONE_NUMBERS=+919876543210

# Studio: ${vars.STUDIO_URL ?? "http://127.0.0.1:54323"}
# DB: postgresql://postgres:postgres@127.0.0.1:54322/postgres
# Test OTP: phone +919876543210 → 123456 (see supabase/config.toml)
`);
} catch (e) {
  console.error("Run `pnpm supabase:start` first, then retry.");
  process.exit(1);
}
