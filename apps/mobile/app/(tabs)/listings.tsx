import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import {
  LISTING_INTENTS,
  PROPERTY_CLASSES,
  PROPERTY_CLASS_LABELS,
  type Listing,
} from "@realpoint/shared";
import { supabase } from "@/lib/supabase";
import { colors } from "@/constants/theme";

export default function ListingsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<(Listing & { localities?: { area_name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [intent, setIntent] = useState<string | null>(null);
  const [propertyClass, setPropertyClass] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("listings")
      .select("*, localities(area_name)")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (intent) q = q.eq("intent", intent);
    if (propertyClass) q = q.eq("property_class", propertyClass);

    const { data } = await q.limit(50);
    setItems(data ?? []);
    setLoading(false);
  }, [intent, propertyClass]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.postBtn}
        onPress={() => router.push("/listings/create")}
      >
        <Text style={styles.postBtnText}>+ Post property</Text>
      </Pressable>
      <FlatList
        horizontal
        data={[null, ...LISTING_INTENTS]}
        keyExtractor={(i) => i ?? "all-intent"}
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        renderItem={({ item: i }) => (
          <Pressable
            style={[styles.chip, intent === i && styles.chipActive]}
            onPress={() => setIntent(i)}
          >
            <Text style={[styles.chipText, intent === i && styles.chipTextActive]}>
              {i ?? "All intents"}
            </Text>
          </Pressable>
        )}
      />
      <FlatList
        horizontal
        data={[null, ...PROPERTY_CLASSES]}
        keyExtractor={(c) => c ?? "all-class"}
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        renderItem={({ item: c }) => (
          <Pressable
            style={[styles.chip, propertyClass === c && styles.chipActive]}
            onPress={() => setPropertyClass(c)}
          >
            <Text
              style={[
                styles.chipText,
                propertyClass === c && styles.chipTextActive,
              ]}
            >
              {c ? PROPERTY_CLASS_LABELS[c] : "All types"}
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
            onPress={() => router.push(`/listings/${item.id}`)}
          >
            <Text style={styles.badge}>
              {item.intent.toUpperCase()} ·{" "}
              {PROPERTY_CLASS_LABELS[item.property_class]}
            </Text>
            <Text style={styles.title}>{item.title}</Text>
            {item.localities?.area_name && (
              <Text style={styles.loc}>{item.localities.area_name}, Surat</Text>
            )}
            <Text style={styles.price}>
              {item.price
                ? `₹${Number(item.price).toLocaleString("en-IN")}`
                : "Price on request"}
              {item.price_negotiable ? " · Negotiable" : ""}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>No listings yet.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  postBtn: {
    margin: 12,
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  postBtnText: { color: "#fff", fontWeight: "700" },
  filters: { maxHeight: 44, marginBottom: 4, paddingHorizontal: 8 },
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
  chipText: { fontSize: 12, color: colors.muted },
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
  badge: { fontSize: 11, color: colors.primary, fontWeight: "600" },
  title: { fontSize: 16, fontWeight: "700", marginTop: 4 },
  loc: { color: colors.muted, marginTop: 4 },
  price: { marginTop: 8, fontWeight: "600" },
  empty: { textAlign: "center", padding: 24, color: colors.muted },
});
