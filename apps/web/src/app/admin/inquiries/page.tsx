import { createClient } from "@/lib/supabase/server";

export default async function AdminInquiriesPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("listing_inquiries")
    .select(
      "id, message, contact_phone, created_at, listings(title, intent), profiles(full_name, phone)"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1>Listing inquiries</h1>
      <p style={{ color: "var(--muted)" }}>
        Buyer messages on published listings (includes M2 demo seed for admin
        listings).
      </p>
      <table>
        <thead>
          <tr>
            <th>Listing</th>
            <th>From</th>
            <th>Message</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          {(rows ?? []).map((r) => {
            const listingRaw = r.listings as
              | { title: string; intent: string }
              | { title: string; intent: string }[]
              | null;
            const listing = Array.isArray(listingRaw) ? listingRaw[0] : listingRaw;
            const profileRaw = r.profiles as
              | { full_name: string | null; phone: string | null }
              | { full_name: string | null; phone: string | null }[]
              | null;
            const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw;
            return (
              <tr key={r.id}>
                <td>
                  {listing?.title ?? "—"}
                  {listing?.intent ? ` (${listing.intent})` : ""}
                </td>
                <td>
                  {profile?.full_name ?? profile?.phone ?? "Anonymous"}
                </td>
                <td>{r.message}</td>
                <td>
                  {new Date(r.created_at).toLocaleString("en-IN")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!rows?.length ? (
        <p className="alert">
          No inquiries — run <code>pnpm seed:m2</code> after demo users exist.
        </p>
      ) : null}
    </div>
  );
}
