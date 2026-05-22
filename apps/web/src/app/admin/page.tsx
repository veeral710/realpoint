import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LoadDemoPackButton } from "@/components/LoadDemoPackButton";
import { isLocalSupabase } from "@/lib/admin";

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
      <p className="alert" style={{ marginBottom: "1rem" }}>
        All counts are <strong>demo / mock</strong> data for local testing. Reset
        with <code>pnpm demo:reset</code> — see{" "}
        <a href="https://github.com/veeral710/realpoint/blob/main/docs/DEMO-DATA.md">
          docs/DEMO-DATA.md
        </a>
        . Presenter walkthrough:{" "}
        <a href="https://github.com/veeral710/realpoint/blob/main/docs/DEMO-SCRIPT.md">
          docs/DEMO-SCRIPT.md
        </a>
        .
      </p>
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
      {isLocalSupabase() ? <LoadDemoPackButton /> : null}
    </div>
  );
}
