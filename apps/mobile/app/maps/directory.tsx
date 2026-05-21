import { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import {
  TP_SCHEME_STATUS_LABELS,
  type TpScheme,
} from "@realpoint/shared";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { colors } from "@/constants/theme";

export default function TpDirectoryScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [schemes, setSchemes] = useState<TpScheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("tp_schemes")
      .select(
        "id, scheme_number, name, name_gu, status, taluka, area_name, description, source_url, pdf_url, center_lat, center_lng, overlay_color, sort_order, is_published, authority, district"
      )
      .eq("is_published", true)
      .order("sort_order")
      .then(({ data }) => {
        setSchemes((data as TpScheme[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return schemes;
    return schemes.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.scheme_number.toLowerCase().includes(q) ||
        (s.area_name?.toLowerCase().includes(q) ?? false) ||
        (s.taluka?.toLowerCase().includes(q) ?? false)
    );
  }, [schemes, query]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search scheme, area, taluka…"
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.number}>{item.scheme_number}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.area_name ?? "Surat"} ·{" "}
              {TP_SCHEME_STATUS_LABELS[item.status]}
            </Text>
            <View style={styles.actions}>
              <Pressable
                style={styles.btn}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/map",
                    params: { scheme: item.id },
                  })
                }
              >
                <Text style={styles.btnText}>Open on map</Text>
              </Pressable>
              <Pressable
                style={styles.btnSecondary}
                onPress={() => router.push(`/maps/${item.id}`)}
              >
                <Text style={styles.btnSecondaryText}>Details</Text>
              </Pressable>
              {item.pdf_url ? (
                <Pressable onPress={() => Linking.openURL(item.pdf_url!)}>
                  <Text style={styles.link}>PDF</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading ? "Loading…" : "No schemes match your search."}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: colors.bg },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  number: { fontWeight: "700", color: colors.primary },
  name: { fontSize: 16, fontWeight: "600", marginTop: 2 },
  meta: { color: colors.muted, marginTop: 4, marginBottom: 10 },
  actions: { flexDirection: "row", alignItems: "center", gap: 10 },
  btn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontWeight: "600" },
  btnSecondary: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnSecondaryText: { color: colors.primary, fontWeight: "600" },
  link: { color: colors.primary, fontWeight: "600" },
  empty: { textAlign: "center", color: colors.muted, marginTop: 24 },
});
