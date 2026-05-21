export function getAdminPhones(): string[] {
  const raw = process.env.ADMIN_PHONE_NUMBERS ?? "";
  return raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

export function getAdminEmails(): string[] {
  const raw =
    process.env.ADMIN_EMAILS ?? "admin@realpoint.local";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const normalized = phone.replace(/\s/g, "");
  return getAdminPhones().some(
    (admin) => admin.replace(/\s/g, "") === normalized
  );
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return getAdminEmails().includes(normalized);
}

export function isLocalSupabase(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (url.includes("127.0.0.1") || url.includes("localhost")) return true;
  // Dev without cloud URL in bundle → treat as local
  if (process.env.NODE_ENV === "development" && !url.includes("supabase.co")) {
    return true;
  }
  return false;
}
