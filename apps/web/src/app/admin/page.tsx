import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: newsCount },
    { count: listingsCount },
    { count: tpCount },
  ] = await Promise.all([
    supabase.from("news_items").select("*", { count: "exact", head: true }),
    supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("tp_schemes")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true),
  ]);

  return (
    <div>
      <h1>Dashboard</h1>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: 1, minWidth: 200 }}>
          <h3>News items</h3>
          <p style={{ fontSize: "2rem", margin: 0 }}>{newsCount ?? 0}</p>
          <Link href="/admin/news">Manage news →</Link>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 200 }}>
          <h3>Published listings</h3>
          <p style={{ fontSize: "2rem", margin: 0 }}>{listingsCount ?? 0}</p>
          <Link href="/admin/listings">Moderate listings →</Link>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 200 }}>
          <h3>TP schemes on map</h3>
          <p style={{ fontSize: "2rem", margin: 0 }}>{tpCount ?? 0}</p>
          <Link href="/admin/tp-schemes">Manage schemes →</Link>
        </div>
      </div>
    </div>
  );
}
