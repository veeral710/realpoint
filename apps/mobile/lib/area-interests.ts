import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

const KEY = "realpoint_area_interests";

export async function getAreaInterests(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch {
      /* ignore */
    }
  }
  return [];
}

export async function setAreaInterests(areas: string[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(areas));
}

export async function saveAreaInterests(
  areas: string[],
  userId?: string | null
): Promise<void> {
  await setAreaInterests(areas);
  if (userId) {
    await supabase
      .from("profiles")
      .update({
        area_interests: areas,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq("id", userId);
  }
}

/** News in user's areas published in the last N days (for tab badge). */
export async function countRecentNewsInAreas(
  areas: string[],
  days = 14
): Promise<number> {
  if (!areas.length) return 0;
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { count, error } = await supabase
    .from("news_items")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true)
    .gte("published_at", since.toISOString())
    .or(
      areas
        .flatMap((a) => [
          `title.ilike.%${a}%`,
          `summary.ilike.%${a}%`,
        ])
        .join(",")
    );
  if (error) return 0;
  return count ?? 0;
}
