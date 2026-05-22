"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoadDemoPackButton() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadPack() {
    setLoading(true);
    setStatus(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("reload_demo_pack");

    setLoading(false);
    if (error) {
      setStatus(error.message);
      return;
    }

    const row = data as { ok?: boolean; message?: string } | null;
    setStatus(row?.message ?? (row?.ok ? "Demo pack loaded" : "No changes"));
    router.refresh();
  }

  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <h3>Demo pack</h3>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        Refreshes buyer inquiries on admin listings without a full{" "}
        <code>pnpm demo:reset</code>. Local admin only.
      </p>
      <button
        type="button"
        className="btn"
        disabled={loading}
        onClick={loadPack}
        style={{ marginTop: "0.5rem" }}
      >
        {loading ? "Loading…" : "Load demo pack"}
      </button>
      {status ? (
        <p className="alert" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
          {status}
        </p>
      ) : null}
    </div>
  );
}
