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
  const { user } = useAuth();
  const [items, setItems] = useState<SavedRow[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("saved_items")
      .select("id, news_item_id, listing_id, news_items(id, title), listings(id, title)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as SavedRow[]));
  }, [user?.id]);

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Please login to view saved items.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      contentContainerStyle={{ padding: 16 }}
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
