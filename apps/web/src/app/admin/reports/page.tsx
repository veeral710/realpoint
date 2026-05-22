import { createClient } from "@/lib/supabase/server";

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("reports")
    .select(
      "id, reason, status, created_at, listing_id, news_item_id, listings(title), news_items(title)"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1>Reports</h1>
      <p style={{ color: "var(--muted)" }}>
        User-submitted reports on listings and news (demo moderation queue).
      </p>
      <table className="table" style={{ marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>When</th>
            <th>Type</th>
            <th>Target</th>
            <th>Reason</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {(rows ?? []).map((r) => {
            const listingRaw = r.listings as
              | { title: string }
              | { title: string }[]
              | null;
            const newsRaw = r.news_items as
              | { title: string }
              | { title: string }[]
              | null;
            const listing = Array.isArray(listingRaw)
              ? listingRaw[0]
              : listingRaw;
            const news = Array.isArray(newsRaw) ? newsRaw[0] : newsRaw;
            const type = r.listing_id ? "Listing" : "News";
            const target = listing?.title ?? news?.title ?? "—";
            return (
              <tr key={r.id}>
                <td>{new Date(r.created_at).toLocaleString()}</td>
                <td>{type}</td>
                <td>{target}</td>
                <td>{r.reason}</td>
                <td>{r.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!rows?.length && (
        <p style={{ marginTop: "1rem" }}>
          No reports yet — use Report on a listing or news item in the mobile app.
        </p>
      )}
    </div>
  );
}
