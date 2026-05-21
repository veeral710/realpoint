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
  NEWS_CATEGORY_LABELS,
  type TpScheme,
  type MapOverlay,
  type SchemeNotice,
} from "@realpoint/shared";
import { supabase } from "@/lib/supabase";
import { colors } from "@/constants/theme";

export default function TpSchemeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [scheme, setScheme] = useState<TpScheme | null>(null);
  const [fpBlocks, setFpBlocks] = useState<MapOverlay[]>([]);
  const [nearbyNotices, setNearbyNotices] = useState<SchemeNotice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("tp_schemes").select("*").eq("id", id).single(),
      supabase.rpc("get_fp_overlays_for_scheme", { p_scheme_id: id }),
      supabase.rpc("get_notices_for_scheme", { p_scheme_id: id }),
    ]).then(([schemeRes, fpRes, noticeRes]) => {
      setScheme(schemeRes.data as TpScheme);
      setFpBlocks((fpRes.data as MapOverlay[]) ?? []);
      setNearbyNotices((noticeRes.data as SchemeNotice[]) ?? []);
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
            params: { scheme: scheme.id, mode: "planning" },
          })
        }
      >
        <Text style={styles.btnText}>Open on planning map</Text>
      </Pressable>
      {fpBlocks.length > 0 ? (
        <View style={styles.fpSection}>
          <Text style={styles.fpHeading}>Final plot (FP) blocks</Text>
          <Text style={styles.fpHint}>
            Sheet-level layout for this TP scheme — shown on map when you open
            FP for this area.
          </Text>
          {fpBlocks.map((fp) => (
            <View key={fp.id} style={styles.fpCard}>
              <Text style={styles.fpName}>{fp.name}</Text>
              {fp.code ? <Text style={styles.meta}>{fp.code}</Text> : null}
              <Pressable
                style={styles.fpMapBtn}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/map",
                    params: {
                      scheme: scheme.id,
                      mode: "planning",
                      showFp: "1",
                    },
                  })
                }
              >
                <Text style={styles.fpMapBtnText}>View FP on map</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.meta}>
          No FP blocks linked yet for this scheme.
        </Text>
      )}
      <View style={styles.noticeSection}>
        <Text style={styles.noticeHeading}>Public notices near this scheme</Text>
        <Text style={styles.noticeHint}>
          Govt circulars and SUDA updates linked to this TP area or within ~8 km.
        </Text>
        {nearbyNotices.length === 0 ? (
          <Text style={styles.meta}>No linked notices yet.</Text>
        ) : (
          nearbyNotices.map((notice) => (
            <Pressable
              key={notice.id}
              style={styles.noticeCard}
              onPress={() => router.push(`/news/${notice.id}`)}
            >
              <Text style={styles.noticeTitle}>{notice.title}</Text>
              <Text style={styles.meta}>
                {NEWS_CATEGORY_LABELS[
                  notice.category as keyof typeof NEWS_CATEGORY_LABELS
                ] ?? notice.category}{" "}
                · {new Date(notice.published_at).toLocaleDateString("en-IN")}
              </Text>
            </Pressable>
          ))
        )}
        <Pressable
          style={styles.noticeMapBtn}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/map",
              params: { scheme: scheme.id, mode: "planning" },
            })
          }
        >
          <Text style={styles.noticeMapBtnText}>Show on planning map</Text>
        </Pressable>
      </View>
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
  fpSection: { marginTop: 20 },
  fpHeading: { fontSize: 16, fontWeight: "700", color: colors.text },
  fpHint: { fontSize: 12, color: colors.muted, marginTop: 4, marginBottom: 10 },
  fpCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: colors.surface,
  },
  fpName: { fontWeight: "600", color: colors.text },
  fpMapBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  fpMapBtnText: { color: colors.primary, fontWeight: "600" },
  noticeSection: { marginTop: 20 },
  noticeHeading: { fontSize: 16, fontWeight: "700", color: colors.text },
  noticeHint: { fontSize: 12, color: colors.muted, marginTop: 4, marginBottom: 10 },
  noticeCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  noticeTitle: { fontWeight: "600", color: colors.text },
  noticeMapBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  noticeMapBtnText: { color: colors.primary, fontWeight: "600" },
});
