import { useCallback, useEffect, useState } from "react";
import type {
  TpSchemeMap,
  MapOverlay,
  VillageMap,
  MapListingPin,
} from "@realpoint/shared";
import { supabase } from "@/lib/supabase";

export function useMapLayers(listingIntent: string | null) {
  const [schemes, setSchemes] = useState<TpSchemeMap[]>([]);
  const [dpOverlays, setDpOverlays] = useState<MapOverlay[]>([]);
  const [fpOverlays, setFpOverlays] = useState<MapOverlay[]>([]);
  const [villages, setVillages] = useState<VillageMap[]>([]);
  const [listings, setListings] = useState<MapListingPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const intentArg = listingIntent ?? "";
    const [tpRes, dpRes, fpRes, vilRes, listRes] = await Promise.all([
      supabase.rpc("get_map_tp_schemes"),
      supabase.rpc("get_map_planning_overlays", { p_layer_type: "dp" }),
      supabase.rpc("get_map_planning_overlays", { p_layer_type: "fp" }),
      supabase.rpc("get_map_villages"),
      supabase.rpc("get_map_listings", { p_intent: intentArg }),
    ]);

    const errors = [
      tpRes.error,
      dpRes.error,
      fpRes.error,
      vilRes.error,
      listRes.error,
    ].filter(Boolean);
    if (errors.length) {
      setError(errors[0]!.message);
    }

    setSchemes((tpRes.data as TpSchemeMap[]) ?? []);
    setDpOverlays((dpRes.data as MapOverlay[]) ?? []);
    setFpOverlays((fpRes.data as MapOverlay[]) ?? []);
    setVillages((vilRes.data as VillageMap[]) ?? []);
    setListings((listRes.data as MapListingPin[]) ?? []);
    setLoading(false);
  }, [listingIntent]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    schemes,
    dpOverlays,
    fpOverlays,
    villages,
    listings,
    loading,
    error,
    refresh,
  };
}
