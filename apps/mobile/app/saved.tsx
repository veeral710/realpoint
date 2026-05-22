import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  countRecentNewsInAreas,
  getAreaInterests,
} from "@/lib/area-interests";
import { colors } from "@/constants/theme";

type SavedRow = {
  id: string;
  news_item_id: string | null;
  listing_id: string | null;
  news_items?: { id: string; title: string } | { id: string; title: string }[] | null;
  listings?: { id: string; title: string } | { id: string; title: string }[] | null;
};

function pickTitle(
  rel?: { title: string } | { title: string }[] | null
): string | undefined {
  if (!rel) return undefined;
  return Array.isArray(rel) ? rel[0]?.title : rel.title;
}

export default function SavedScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [items, setItems] = useState<SavedRow[]>([]);
  const [areaCounts, setAreaCounts] = useState<{ area: string; count: number }[]>(
    []
  );

  useEffect(() => {
    if (!user) return;
    supabase
      .from("saved_items")
      .select("id, news_item_id, listing_id, news_items(id, title), listings(id, title)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as SavedRow[]));
  }, [user?.id]);

  useEffect(() => {
    (async () => {
      const fromProfile = profile?.area_interests?.filter(Boolean) ?? [];
      const areas = fromProfile.length
        ? fromProfile
        : await getAreaInterests();
      const rows = await Promise.all(
        areas.map(async (area) => ({
          area,
          count: await countRecentNewsInAreas([area], 14),
        }))
      );
      setAreaCounts(rows.filter((r) => r.count > 0));
    })();
  }, [profile?.area_interests?.join(",")]);

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Please login to view saved items.</Text>
      </View>
    );
  }

  const listHeader =
    areaCounts.length > 0 ? (
      <View style={styles.alertBox}>
        <Text style={styles.alertTitle}>New in your areas (demo)</Text>
        {areaCounts.map(({ area, count }) => (
          <Text key={area} style={styles.alertLine}>
            {area}: {count} notice{count === 1 ? "" : "s"} in last 14 days
          </Text>
        ))}
        <Pressable onPress={() => router.push("/areas")}>
          <Text style={styles.alertLink}>Edit areas →</Text>
        </Pressable>
      </View>
    ) : (
      <Pressable style={styles.alertBox} onPress={() => router.push("/areas")}>
        <Text style={styles.alertLink}>Set areas of interest for alerts →</Text>
      </Pressable>
    );

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      contentContainerStyle={{ padding: 16 }}
      ListHeaderComponent={listHeader}
      renderItem={({ item }) => {
        const isNews = !!item.news_item_id;
        const title =
          pickTitle(item.news_items) ??
          pickTitle(item.listings) ??
          "Saved item";
        const href = isNews
          ? `/news/${item.news_item_id}`
          : `/listings/${item.listing_id}`;
        return (
          <Pressable style={styles.card} onPress={() => router.push(href as never)}>
            <Text style={styles.badge}>{isNews ? "News" : "Listing"}</Text>
            <Text style={styles.title}>{title}</Text>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <Text style={styles.empty}>No saved items yet.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  alertBox: {
    padding: 14,
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#c8e6c9",
  },
  alertTitle: { fontWeight: "700", marginBottom: 6, color: colors.text },
  alertLine: { fontSize: 13, color: colors.muted, marginBottom: 2 },
  alertLink: { color: colors.primary, fontWeight: "600", marginTop: 6 },
  card: {
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  badge: { fontSize: 11, color: colors.primary, fontWeight: "600" },
  title: { fontSize: 16, fontWeight: "600", marginTop: 4 },
  empty: { textAlign: "center", color: colors.muted, padding: 24 },
});
