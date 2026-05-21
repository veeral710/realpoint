import { createClient } from "@/lib/supabase/server";
import { PROPERTY_CLASS_LABELS } from "@realpoint/shared";
import { ListingActions } from "@/components/ListingActions";

export default async function AdminListingsPage() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, intent, property_class, status, price, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1>Listings moderation</h1>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Intent</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(listings ?? []).length === 0 && (
            <tr>
              <td colSpan={6} style={{ color: "var(--muted)" }}>
                No listings yet. Run <code>pnpm seed:listings</code> or post from mobile.
              </td>
            </tr>
          )}
          {(listings ?? []).map((l) => (
            <tr key={l.id}>
              <td>{l.title}</td>
              <td>
                {PROPERTY_CLASS_LABELS[l.property_class as keyof typeof PROPERTY_CLASS_LABELS] ?? l.property_class}
              </td>
              <td>{l.intent}</td>
              <td>{l.price ? `₹${Number(l.price).toLocaleString("en-IN")}` : "—"}</td>
              <td>{l.status}</td>
              <td>
                <ListingActions listingId={l.id} status={l.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
