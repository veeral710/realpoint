import { createClient } from "@/lib/supabase/server";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data: events } = await supabase
    .from("analytics_events")
    .select("event_name, screen, created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(500);

  const counts: Record<string, number> = {};
  for (const e of events ?? []) {
    const key = e.screen ? `${e.event_name} · ${e.screen}` : e.event_name;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <h1>Analytics (demo)</h1>
      <p style={{ color: "var(--muted)" }}>
        Mobile screen events from the last 7 days (local dev only).
      </p>
      <ul style={{ marginTop: "1rem" }}>
        {sorted.map(([key, n]) => (
          <li key={key}>
            <strong>{key}</strong> — {n}
          </li>
        ))}
      </ul>
      {!sorted.length && (
        <p>Open tabs in the mobile app to generate events.</p>
      )}
      <p style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--muted)" }}>
        Total events: {events?.length ?? 0}
      </p>
    </div>
  );
}
