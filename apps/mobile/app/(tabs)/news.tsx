import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
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
  ONBOARDING_AREAS,
  type NewsItem,
} from "@realpoint/shared";
import { supabase } from "@/lib/supabase";
import { getAreaInterests } from "@/lib/area-interests";
import { trackEvent } from "@/lib/analytics";
import { getLocale, pickLocalized, type Locale } from "@/lib/i18n";
import { DemoBanner } from "@/components/DemoBanner";
import { FilterChipRow } from "@/components/FilterChipRow";
import { colors } from "@/constants/theme";

export default function NewsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>("en");
  const [areaInitialized, setAreaInitialized] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("news_items")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (category) q = q.eq("category", category);
    const qTrim = query.trim();
    if (area && qTrim) {
      q = q.or(
        `title.ilike.%${area}%,summary.ilike.%${area}%,title.ilike.%${qTrim}%,summary.ilike.%${qTrim}%`
      );
    } else if (area) {
      q = q.or(`title.ilike.%${area}%,summary.ilike.%${area}%`);
    } else if (qTrim) {
      q = q.or(`title.ilike.%${qTrim}%,summary.ilike.%${qTrim}%`);
    }

    const { data } = await q.limit(50);
    setItems((data as NewsItem[]) ?? []);
    setLoading(false);
  }, [category, area, query]);

  useEffect(() => {
    trackEvent("screen_view", "news");
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      getLocale().then(setLocale);
    }, [])
  );

  useEffect(() => {
    if (areaInitialized) return;
    (async () => {
      const areas = await getAreaInterests();
      if (areas[0]) setArea(areas[0]);
      setAreaInitialized(true);
    })();
  }, [areaInitialized]);

  const header = (
    <View style={styles.header}>
      <DemoBanner />
      <TextInput
        style={styles.search}
        placeholder="Search news…"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={load}
        returnKeyType="search"
      />
      <FilterChipRow
        chips={[
          { value: null, label: "All categories" },
          ...NEWS_CATEGORIES.map((c) => ({
            value: c,
            label: NEWS_CATEGORY_LABELS[c],
          })),
        ]}
        selected={category}
        onSelect={setCategory}
      />
      <FilterChipRow
        chips={[
          { value: null, label: "All areas" },
          ...ONBOARDING_AREAS.map((a) => ({ value: a, label: a })),
        ]}
        selected={area}
        onSelect={setArea}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={header}
        contentContainerStyle={styles.listContent}
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
  container: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.bg },
  listContent: { paddingBottom: 24 },
  search: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
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
  title: { fontSize: 16, fontWeight: "700", marginBottom: 4, color: colors.text },
  summary: { color: colors.muted, fontSize: 14 },
  date: { marginTop: 8, fontSize: 12, color: colors.muted },
  empty: { textAlign: "center", padding: 24, color: colors.muted },
});
