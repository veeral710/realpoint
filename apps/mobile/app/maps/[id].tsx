import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  TP_SCHEME_STATUS_LABELS,
  MAP_DISCLAIMER,
  type TpScheme,
} from "@realpoint/shared";
import { supabase } from "@/lib/supabase";
import { colors } from "@/constants/theme";

export default function TpSchemeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [scheme, setScheme] = useState<TpScheme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("tp_schemes")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setScheme(data as TpScheme);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!scheme) {
    return (
      <View style={styles.center}>
        <Text>Scheme not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.number}>{scheme.scheme_number}</Text>
      <Text style={styles.title}>{scheme.name}</Text>
      {scheme.name_gu ? (
        <Text style={styles.gu}>{scheme.name_gu}</Text>
      ) : null}
      <Text style={styles.meta}>
        {scheme.authority} · {scheme.taluka ?? scheme.district} ·{" "}
        {TP_SCHEME_STATUS_LABELS[scheme.status]}
      </Text>
      {scheme.area_name ? (
        <Text style={styles.meta}>Area: {scheme.area_name}</Text>
      ) : null}
      {scheme.description ? (
        <Text style={styles.body}>{scheme.description}</Text>
      ) : null}
      <Pressable
        style={styles.btn}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/map",
            params: { scheme: scheme.id },
          })
        }
      >
        <Text style={styles.btnText}>Open on map</Text>
      </Pressable>
      {scheme.source_url ? (
        <Pressable
          style={styles.linkBtn}
          onPress={() => Linking.openURL(scheme.source_url!)}
        >
          <Text style={styles.linkText}>Official source</Text>
        </Pressable>
      ) : null}
      {scheme.pdf_url ? (
        <Pressable
          style={styles.linkBtn}
          onPress={() => Linking.openURL(scheme.pdf_url!)}
        >
          <Text style={styles.linkText}>View scheme PDF</Text>
        </Pressable>
      ) : null}
      <Text style={styles.disclaimer}>{MAP_DISCLAIMER}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  number: { color: colors.primary, fontWeight: "700" },
  title: { fontSize: 22, fontWeight: "700", marginTop: 4 },
  gu: { fontSize: 16, color: colors.muted, marginTop: 4 },
  meta: { color: colors.muted, marginTop: 6 },
  body: { marginTop: 12, lineHeight: 22 },
  btn: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  btnText: { color: "#fff", fontWeight: "700" },
  linkBtn: { marginTop: 10, alignItems: "center" },
  linkText: { color: colors.primary, fontWeight: "600" },
  disclaimer: { fontSize: 12, color: colors.muted, marginTop: 20 },
});
