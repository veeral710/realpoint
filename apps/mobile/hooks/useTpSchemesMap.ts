import { useCallback, useEffect, useState } from "react";
import type { TpSchemeMap } from "@realpoint/shared";
import { supabase } from "@/lib/supabase";

export function useTpSchemesMap() {
  const [schemes, setSchemes] = useState<TpSchemeMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("get_map_tp_schemes");
    if (rpcError) {
      const { data: rows, error: tableError } = await supabase
        .from("tp_schemes")
        .select(
          "id, scheme_number, name, status, taluka, area_name, center_lat, center_lng, overlay_color, pdf_url, source_url, sort_order"
        )
        .eq("is_published", true)
        .order("sort_order");
      setLoading(false);
      if (tableError) {
        setError(tableError.message);
        return;
      }
      setSchemes((rows ?? []) as TpSchemeMap[]);
      return;
    }
    setSchemes((data as TpSchemeMap[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { schemes, loading, error, refresh };
}
