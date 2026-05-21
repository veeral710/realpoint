import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TP_SCHEME_STATUS_LABELS } from "@realpoint/shared";

export default async function AdminTpSchemesPage() {
  const supabase = await createClient();
  const { data: schemes } = await supabase
    .from("tp_schemes")
    .select("id, scheme_number, name, taluka, area_name, status, is_published, sort_order")
    .order("sort_order");

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>TP schemes (Surat)</h1>
        <Link className="btn" href="/admin/tp-schemes/new">
          Add scheme
        </Link>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>
        Map overlays use approximate boundaries for development. Replace with
        georeferenced tiles when official sheets are available.
      </p>
      <table>
        <thead>
          <tr>
            <th>Number</th>
            <th>Name</th>
            <th>Area</th>
            <th>Status</th>
            <th>Live</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(schemes ?? []).map((scheme) => (
            <tr key={scheme.id}>
              <td>{scheme.scheme_number}</td>
              <td>{scheme.name}</td>
              <td>
                {scheme.area_name ?? "—"}
                {scheme.taluka ? ` (${scheme.taluka})` : ""}
              </td>
              <td>
                <span className="badge">
                  {TP_SCHEME_STATUS_LABELS[
                    scheme.status as keyof typeof TP_SCHEME_STATUS_LABELS
                  ] ?? scheme.status}
                </span>
              </td>
              <td>{scheme.is_published ? "Yes" : "No"}</td>
              <td>
                <Link href={`/admin/tp-schemes/${scheme.id}`}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
