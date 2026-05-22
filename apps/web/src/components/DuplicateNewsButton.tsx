"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DuplicateNewsButton({
  itemId,
}: {
  itemId: string;
}) {
  const router = useRouter();

  async function duplicate() {
    const supabase = createClient();
    const { data: row, error: fetchErr } = await supabase
      .from("news_items")
      .select(
        "title, title_gu, summary, summary_gu, category, source_url, pdf_url, locality_id, tp_scheme_id, latitude, longitude, is_demo"
      )
      .eq("id", itemId)
      .single();

    if (fetchErr || !row) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("news_items").insert({
      ...row,
      title: `[Demo] Copy — ${row.title}`.slice(0, 200),
      published_at: new Date().toISOString(),
      is_published: false,
      created_by: user?.id,
      is_demo: true,
    });

    if (!error) router.refresh();
  }

  return (
    <button
      type="button"
      className="btn btn-secondary"
      style={{ marginLeft: 8, padding: "4px 10px", fontSize: "0.85rem" }}
      onClick={duplicate}
    >
      Duplicate
    </button>
  );
}
