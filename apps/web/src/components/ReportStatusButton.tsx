"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ReportStatusButton({
  reportId,
  status,
}: {
  reportId: string;
  status: string;
}) {
  const router = useRouter();

  async function setStatus(next: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("reports")
      .update({ status: next })
      .eq("id", reportId);
    if (!error) router.refresh();
  }

  if (status === "closed") {
    return <span style={{ color: "var(--muted)" }}>Closed</span>;
  }

  return (
    <button
      type="button"
      className="btn btn-secondary"
      style={{ padding: "4px 10px", fontSize: "0.85rem" }}
      onClick={() => setStatus("closed")}
    >
      Mark closed
    </button>
  );
}
