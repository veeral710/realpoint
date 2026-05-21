import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NEWS_CATEGORY_LABELS } from "@realpoint/shared";

export default async function AdminNewsPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("news_items")
    .select("id, title, category, published_at, is_published")
    .order("published_at", { ascending: false });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>News & circulars</h1>
        <Link className="btn" href="/admin/news/new">
          Add news
        </Link>
      </div>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Published</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(items ?? []).map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>
                <span className="badge">
                  {NEWS_CATEGORY_LABELS[item.category as keyof typeof NEWS_CATEGORY_LABELS] ?? item.category}
                </span>
              </td>
              <td>{new Date(item.published_at).toLocaleDateString("en-IN")}</td>
              <td>{item.is_published ? "Live" : "Draft"}</td>
              <td>
                <Link href={`/admin/news/${item.id}`}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
