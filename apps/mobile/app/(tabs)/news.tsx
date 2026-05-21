import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import {
  NEWS_CATEGORIES,
  NEWS_CATEGORY_LABELS,
  type NewsItem,
} from "@realpoint/shared";
import { supabase } from "@/lib/supabase";
import { getLocale, pickLocalized, type Locale } from "@/lib/i18n";
import { colors } from "@/constants/theme";

export default function NewsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>("en");

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("news_items")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (category) q = q.eq("category", category);
    if (query.trim()) {
      q = q.or(`title.ilike.%${query}%,summary.ilike.%${query}%`);
    }

    const { data } = await q.limit(50);
    setItems((data as NewsItem[]) ?? []);
    setLoading(false);
  }, [category, query]);

  useEffect(() => {
    getLocale().then(setLocale);
    load();
  }, [load]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search news…"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={load}
        returnKeyType="search"
      />
      <FlatList
        horizontal
        data={[null, ...NEWS_CATEGORIES]}
        keyExtractor={(c) => c ?? "all"}
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        renderItem={({ item: c }) => (
          <Pressable
            style={[styles.chip, category === c && styles.chipActive]}
            onPress={() => setCategory(c)}
          >
            <Text
              style={[
                styles.chipText,
                category === c && styles.chipTextActive,
              ]}
            >
              {c ? NEWS_CATEGORY_LABELS[c] : "All"}
            </Text>
          </Pressable>
        )}
      />
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/news/${item.id}`)}
          >
            <Text style={styles.badge}>
              {NEWS_CATEGORY_LABELS[item.category]}
            </Text>
            <Text style={styles.title}>
              {pickLocalized(item.title, item.title_gu, locale)}
            </Text>
            <Text style={styles.summary} numberOfLines={2}>
              {pickLocalized(item.summary, item.summary_gu, locale)}
            </Text>
            <Text style={styles.date}>
              {new Date(item.published_at).toLocaleDateString("en-IN")}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>No news yet. Check Supabase setup.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: {
    margin: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filters: { maxHeight: 44, marginBottom: 8, paddingHorizontal: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.muted },
  chipTextActive: { color: colors.primary, fontWeight: "600" },
  card: {
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: 4,
  },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  summary: { color: colors.muted, fontSize: 14 },
  date: { marginTop: 8, fontSize: 12, color: colors.muted },
  empty: { textAlign: "center", padding: 24, color: colors.muted },
});
