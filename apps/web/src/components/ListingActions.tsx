"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ListingActions({
  listingId,
  status,
}: {
  listingId: string;
  status: string;
}) {
  const router = useRouter();

  async function setStatus(newStatus: string) {
    const supabase = createClient();
    await supabase
      .from("listings")
      .update({ status: newStatus })
      .eq("id", listingId);
    router.refresh();
  }

  return (
    <span style={{ display: "flex", gap: "0.5rem" }}>
      {status !== "published" && (
        <button className="btn" type="button" onClick={() => setStatus("published")}>
          Publish
        </button>
      )}
      {status === "published" && (
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => setStatus("archived")}
        >
          Archive
        </button>
      )}
    </span>
  );
}
