"use client";

import { useEffect, useState } from "react";
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
  locality_id: string | null;
  tp_scheme_id: string | null;
  latitude: number | null;
  longitude: number | null;
};

type LocalityOption = { id: string; area_name: string };
type TpSchemeOption = { id: string; scheme_number: string; name: string };

export function NewsForm({ item }: { item?: NewsRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localities, setLocalities] = useState<LocalityOption[]>([]);
  const [tpSchemes, setTpSchemes] = useState<TpSchemeOption[]>([]);

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
    locality_id: item?.locality_id ?? "",
    tp_scheme_id: item?.tp_scheme_id ?? "",
    latitude: item?.latitude != null ? String(item.latitude) : "",
    longitude: item?.longitude != null ? String(item.longitude) : "",
  });

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase
        .from("localities")
        .select("id, area_name")
        .eq("district", "Surat")
        .order("area_name"),
      supabase
        .from("tp_schemes")
        .select("id, scheme_number, name")
        .eq("is_published", true)
        .order("scheme_number"),
    ]).then(([locRes, tpRes]) => {
      setLocalities((locRes.data as LocalityOption[]) ?? []);
      setTpSchemes((tpRes.data as TpSchemeOption[]) ?? []);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    setLoading(true);
    setError(null);

    const lat = form.latitude.trim() ? Number(form.latitude) : null;
    const lng = form.longitude.trim() ? Number(form.longitude) : null;
    if (
      (lat != null && Number.isNaN(lat)) ||
      (lng != null && Number.isNaN(lng))
    ) {
      setError("Latitude and longitude must be valid numbers.");
      setLoading(false);
      return;
    }

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
      locality_id: form.locality_id || null,
      tp_scheme_id: form.tp_scheme_id || null,
      latitude: lat,
      longitude: lng,
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
      <h3 style={{ marginTop: 16 }}>Map / trust (optional)</h3>
      <p className="muted" style={{ fontSize: 13 }}>
        Link to a locality or TP scheme for “notices near this scheme” and the
        planning map heatmap.
      </p>
      <label>Locality</label>
      <select
        value={form.locality_id}
        onChange={(e) => setForm({ ...form, locality_id: e.target.value })}
      >
        <option value="">— None —</option>
        {localities.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.area_name}
          </option>
        ))}
      </select>
      <label>TP scheme</label>
      <select
        value={form.tp_scheme_id}
        onChange={(e) => setForm({ ...form, tp_scheme_id: e.target.value })}
      >
        <option value="">— None —</option>
        {tpSchemes.map((s) => (
          <option key={s.id} value={s.id}>
            {s.scheme_number} — {s.name}
          </option>
        ))}
      </select>
      <label>Latitude</label>
      <input
        type="number"
        step="any"
        placeholder="21.17"
        value={form.latitude}
        onChange={(e) => setForm({ ...form, latitude: e.target.value })}
      />
      <label>Longitude</label>
      <input
        type="number"
        step="any"
        placeholder="72.83"
        value={form.longitude}
        onChange={(e) => setForm({ ...form, longitude: e.target.value })}
      />
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
