"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TP_SCHEME_STATUSES,
  TP_SCHEME_STATUS_LABELS,
} from "@realpoint/shared";
import { createClient } from "@/lib/supabase/client";

type TpSchemeRow = {
  id: string;
  scheme_number: string;
  name: string;
  name_gu: string | null;
  status: string;
  authority: string;
  district: string;
  taluka: string | null;
  area_name: string | null;
  description: string | null;
  source_url: string | null;
  pdf_url: string | null;
  center_lat: number;
  center_lng: number;
  overlay_color: string | null;
  sort_order: number;
  is_published: boolean;
};

export function TpSchemeForm({ item }: { item?: TpSchemeRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    scheme_number: item?.scheme_number ?? "",
    name: item?.name ?? "",
    name_gu: item?.name_gu ?? "",
    status: item?.status ?? "final",
    authority: item?.authority ?? "SUDA",
    district: item?.district ?? "Surat",
    taluka: item?.taluka ?? "",
    area_name: item?.area_name ?? "",
    description: item?.description ?? "",
    source_url: item?.source_url ?? "",
    pdf_url: item?.pdf_url ?? "",
    center_lat: String(item?.center_lat ?? 21.1702),
    center_lng: String(item?.center_lng ?? 72.8311),
    overlay_color: item?.overlay_color ?? "#1b6b4a",
    sort_order: String(item?.sort_order ?? 0),
    is_published: item?.is_published ?? true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    setLoading(true);
    setError(null);

    const payload = {
      scheme_number: form.scheme_number.trim(),
      name: form.name.trim(),
      name_gu: form.name_gu || null,
      status: form.status,
      authority: form.authority,
      district: form.district,
      taluka: form.taluka || null,
      area_name: form.area_name || null,
      description: form.description || null,
      source_url: form.source_url || null,
      pdf_url: form.pdf_url || null,
      center_lat: parseFloat(form.center_lat),
      center_lng: parseFloat(form.center_lng),
      overlay_color: form.overlay_color,
      sort_order: parseInt(form.sort_order, 10) || 0,
      is_published: form.is_published,
    };

    if (item) {
      const { error: err } = await supabase
        .from("tp_schemes")
        .update(payload)
        .eq("id", item.id);
      if (err) setError(err.message);
      else router.push("/admin/tp-schemes");
    } else {
      const { error: err } = await supabase.from("tp_schemes").insert(payload);
      if (err) setError(err.message);
      else router.push("/admin/tp-schemes");
    }
    setLoading(false);
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      {error && <div className="alert">{error}</div>}
      <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        Boundary polygons are seeded via SQL migrations for now. Editing center
        coordinates updates the map marker; overlay shape requires a DB update.
      </p>
      <label>Scheme number</label>
      <input
        value={form.scheme_number}
        onChange={(e) => setForm({ ...form, scheme_number: e.target.value })}
        required
      />
      <label>Name (English)</label>
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <label>Name (Gujarati)</label>
      <input
        value={form.name_gu}
        onChange={(e) => setForm({ ...form, name_gu: e.target.value })}
      />
      <label>Status</label>
      <select
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
      >
        {TP_SCHEME_STATUSES.map((s) => (
          <option key={s} value={s}>
            {TP_SCHEME_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <label>Taluka</label>
      <input
        value={form.taluka}
        onChange={(e) => setForm({ ...form, taluka: e.target.value })}
      />
      <label>Area name</label>
      <input
        value={form.area_name}
        onChange={(e) => setForm({ ...form, area_name: e.target.value })}
      />
      <label>Description</label>
      <textarea
        rows={4}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <label>Center latitude</label>
      <input
        type="number"
        step="any"
        value={form.center_lat}
        onChange={(e) => setForm({ ...form, center_lat: e.target.value })}
        required
      />
      <label>Center longitude</label>
      <input
        type="number"
        step="any"
        value={form.center_lng}
        onChange={(e) => setForm({ ...form, center_lng: e.target.value })}
        required
      />
      <label>Overlay color (#hex)</label>
      <input
        value={form.overlay_color}
        onChange={(e) => setForm({ ...form, overlay_color: e.target.value })}
      />
      <label>Source URL</label>
      <input
        value={form.source_url}
        onChange={(e) => setForm({ ...form, source_url: e.target.value })}
      />
      <label>PDF URL</label>
      <input
        value={form.pdf_url}
        onChange={(e) => setForm({ ...form, pdf_url: e.target.value })}
      />
      <label>Sort order</label>
      <input
        type="number"
        value={form.sort_order}
        onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
      />
      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={form.is_published}
          onChange={(e) =>
            setForm({ ...form, is_published: e.target.checked })
          }
        />
        Published on map & directory
      </label>
      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Saving…" : item ? "Update scheme" : "Create scheme"}
      </button>
    </form>
  );
}
