"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  NEWS_CATEGORIES,
  NEWS_CATEGORY_LABELS,
  type CreateNewsItem,
} from "@realpoint/shared";
import { createClient } from "@/lib/supabase/client";

type NewsRow = {
  id: string;
  title: string;
  title_gu: string | null;
  summary: string;
  summary_gu: string | null;
  category: string;
  source_url: string | null;
  pdf_url: string | null;
  published_at: string;
  is_published: boolean;
};

export function NewsForm({ item }: { item?: NewsRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: item?.title ?? "",
    title_gu: item?.title_gu ?? "",
    summary: item?.summary ?? "",
    summary_gu: item?.summary_gu ?? "",
    category: item?.category ?? "general",
    source_url: item?.source_url ?? "",
    pdf_url: item?.pdf_url ?? "",
    published_at: item?.published_at
      ? new Date(item.published_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    is_published: item?.is_published ?? true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    setLoading(true);
    setError(null);

    const payload = {
      title: form.title,
      title_gu: form.title_gu || null,
      summary: form.summary,
      summary_gu: form.summary_gu || null,
      category: form.category,
      source_url: form.source_url || null,
      pdf_url: form.pdf_url || null,
      published_at: new Date(form.published_at).toISOString(),
      is_published: form.is_published,
    };

    if (item) {
      const { error: err } = await supabase
        .from("news_items")
        .update(payload)
        .eq("id", item.id);
      if (err) setError(err.message);
      else router.push("/admin/news");
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error: err } = await supabase.from("news_items").insert({
        ...payload,
        created_by: user?.id,
      });
      if (err) setError(err.message);
      else router.push("/admin/news");
    }
    setLoading(false);
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      {error && <div className="alert">{error}</div>}
      <label>Title (English)</label>
      <input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />
      <label>Title (Gujarati)</label>
      <input
        value={form.title_gu}
        onChange={(e) => setForm({ ...form, title_gu: e.target.value })}
      />
      <label>Summary (English)</label>
      <textarea
        rows={4}
        value={form.summary}
        onChange={(e) => setForm({ ...form, summary: e.target.value })}
        required
      />
      <label>Summary (Gujarati)</label>
      <textarea
        rows={4}
        value={form.summary_gu}
        onChange={(e) => setForm({ ...form, summary_gu: e.target.value })}
      />
      <label>Category</label>
      <select
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      >
        {NEWS_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {NEWS_CATEGORY_LABELS[c]}
          </option>
        ))}
      </select>
      <label>Source URL</label>
      <input
        type="url"
        value={form.source_url}
        onChange={(e) => setForm({ ...form, source_url: e.target.value })}
      />
      <label>PDF URL</label>
      <input
        type="url"
        value={form.pdf_url}
        onChange={(e) => setForm({ ...form, pdf_url: e.target.value })}
      />
      <label>Published at</label>
      <input
        type="datetime-local"
        value={form.published_at}
        onChange={(e) => setForm({ ...form, published_at: e.target.value })}
      />
      <label>
        <input
          type="checkbox"
          checked={form.is_published}
          onChange={(e) =>
            setForm({ ...form, is_published: e.target.checked })
          }
        />{" "}
        Published
      </label>
      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Saving…" : item ? "Update" : "Create"}
      </button>
    </form>
  );
}
