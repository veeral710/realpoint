import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TpSchemeForm } from "@/components/TpSchemeForm";

export default async function EditTpSchemePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase
    .from("tp_schemes")
    .select("*")
    .eq("id", id)
    .single();

  if (!item) notFound();

  return (
    <div>
      <h1>Edit TP scheme</h1>
      <TpSchemeForm item={item} />
    </div>
  );
}
