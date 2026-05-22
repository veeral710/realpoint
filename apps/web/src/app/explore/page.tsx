import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NEWS_CATEGORY_LABELS } from "@realpoint/shared";

export default async function ExplorePage() {
  const supabase = await createClient();

  const [{ data: news }, { data: listings }] = await Promise.all([
    supabase
      .from("news_items")
      .select("id, title, category, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(12),
    supabase
      .from("listings")
      .select("id, title, intent, price, address_text, zone_name")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  return (
    <>
      <nav className="nav">
        <Link href="/" className="brand">
          RealPoint
        </Link>
        <Link href="/explore">Explore</Link>
        <Link href="/admin">Admin</Link>
      </nav>
      <main className="container">
        <h1>Explore (read-only demo)</h1>
        <p className="alert">
          Sample Surat data from local Supabase — same content as the mobile app.
          No login required.
        </p>

        <section className="card" style={{ marginTop: "1.5rem" }}>
          <h2>Latest news</h2>
          {!news?.length ? (
            <p>No published news — run <code>pnpm demo:reset</code>.</p>
          ) : (
            <ul>
              {news.map((n) => (
                <li key={n.id}>
                  <strong>{n.title}</strong>
                  <span style={{ color: "var(--muted)", marginLeft: 8 }}>
                    {NEWS_CATEGORY_LABELS[
                      n.category as keyof typeof NEWS_CATEGORY_LABELS
                    ] ?? n.category}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card" style={{ marginTop: "1rem" }}>
          <h2>Published listings</h2>
          {!listings?.length ? (
            <p>No published listings.</p>
          ) : (
            <ul>
              {listings.map((l) => (
                <li key={l.id}>
                  <strong>{l.title}</strong>
                  {l.price != null ? (
                    <span style={{ marginLeft: 8 }}>
                      ₹{Number(l.price).toLocaleString("en-IN")}
                    </span>
                  ) : null}
                  <span style={{ color: "var(--muted)", marginLeft: 8 }}>
                    {l.intent}
                    {l.zone_name || l.address_text
                      ? ` · ${l.zone_name ?? l.address_text}`
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/">← Home</Link>
        </p>
      </main>
    </>
  );
}
