import { createClient } from "@/lib/supabase/server";

export default async function AdminDocumentRequestsPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("document_requests")
    .select(
      "id, reference_code, request_type, status, survey_number, village_name, contact_phone, created_at, profiles(full_name)"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1>Document requests (demo)</h1>
      <p style={{ color: "var(--muted)" }}>
        7/12 and property card mock submissions from the mobile app.
      </p>
      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Type</th>
            <th>Status</th>
            <th>Survey / village</th>
            <th>Phone</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          {(rows ?? []).map((r) => (
            <tr key={r.id}>
              <td>
                <code>{r.reference_code}</code>
              </td>
              <td>{r.request_type}</td>
              <td>{r.status}</td>
              <td>
                {r.survey_number ?? "—"}
                {r.village_name ? ` · ${r.village_name}` : ""}
              </td>
              <td>{r.contact_phone ?? "—"}</td>
              <td>
                {new Date(r.created_at).toLocaleString("en-IN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows?.length ? (
        <p className="alert">No requests yet — submit from mobile Account tab.</p>
      ) : null}
    </div>
  );
}
