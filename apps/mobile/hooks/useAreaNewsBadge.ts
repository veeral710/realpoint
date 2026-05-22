import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  countRecentNewsInAreas,
  getAreaInterests,
} from "@/lib/area-interests";

export function useAreaNewsBadge() {
  const { profile } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fromProfile = profile?.area_interests?.filter(Boolean) ?? [];
      const areas = fromProfile.length
        ? fromProfile
        : await getAreaInterests();
      const n = await countRecentNewsInAreas(areas);
      if (!cancelled) setCount(n);
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.area_interests?.join(",")]);

  return count > 0 ? (count > 9 ? "9+" : String(count)) : undefined;
}
