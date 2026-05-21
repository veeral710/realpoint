import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewsForm } from "@/components/NewsForm";

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase
    .from("news_items")
    .select("*")
    .eq("id", id)
    .single();

  if (!item) notFound();

  return (
    <div>
      <h1>Edit news</h1>
      <NewsForm item={item} />
    </div>
  );
}
