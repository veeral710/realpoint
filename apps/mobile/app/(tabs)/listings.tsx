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
import { DemoBanner } from "@/components/DemoBanner";
import { FilterChipRow } from "@/components/FilterChipRow";
import { colors } from "@/constants/theme";

type ListingRow = Listing & { localities?: { area_name: string } };

export default function ListingsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<ListingRow[]>([]);
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

  const header = (
    <View style={styles.header}>
      <DemoBanner />
      <Pressable
        style={styles.postBtn}
        onPress={() => router.push("/listings/create")}
      >
        <Text style={styles.postBtnText}>+ Post property</Text>
      </Pressable>
      <FilterChipRow
        chips={[
          { value: null, label: "All intents" },
          ...LISTING_INTENTS.map((i) => ({
            value: i,
            label: i.charAt(0).toUpperCase() + i.slice(1),
          })),
        ]}
        selected={intent}
        onSelect={setIntent}
      />
      <FilterChipRow
        chips={[
          { value: null, label: "All types" },
          ...PROPERTY_CLASSES.map((c) => ({
            value: c,
            label: PROPERTY_CLASS_LABELS[c],
          })),
        ]}
        selected={propertyClass}
        onSelect={setPropertyClass}
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
  container: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.bg },
  listContent: { paddingBottom: 24 },
  postBtn: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  postBtnText: { color: "#fff", fontWeight: "700" },
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
  title: { fontSize: 16, fontWeight: "700", marginTop: 4, color: colors.text },
  loc: { color: colors.muted, marginTop: 4 },
  price: { marginTop: 8, fontWeight: "600", color: colors.text },
  empty: { textAlign: "center", padding: 24, color: colors.muted },
});
