import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  StyleSheet,
  Share,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  NEWS_CATEGORY_LABELS,
  type NewsItem,
} from "@realpoint/shared";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { getLocale, pickLocalized, type Locale } from "@/lib/i18n";
import { ReportMenu } from "@/components/ReportMenu";
import { colors } from "@/constants/theme";

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [saved, setSaved] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    getLocale().then(setLocale);
    supabase
      .from("news_items")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => setItem(data as NewsItem | null));

    if (user) {
      supabase
        .from("saved_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("news_item_id", id)
        .maybeSingle()
        .then(({ data }) => setSaved(!!data));
    }
  }, [id, user?.id]);

  async function toggleSave() {
    if (!user) {
      Alert.alert("Login required", "Sign in to save items.");
      return;
    }
    if (saved) {
      await supabase
        .from("saved_items")
        .delete()
        .eq("user_id", user.id)
        .eq("news_item_id", id);
      setSaved(false);
    } else {
      await supabase.from("saved_items").insert({
        user_id: user.id,
        news_item_id: id,
      });
      setSaved(true);
    }
  }

  if (!item) {
    return (
      <View style={styles.centered}>
        <Text>Loading…</Text>
      </View>
    );
  }

  const title = pickLocalized(item.title, item.title_gu, locale);
  const summary = pickLocalized(item.summary, item.summary_gu, locale);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.badge}>
        {NEWS_CATEGORY_LABELS[item.category]}
      </Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>
        {new Date(item.published_at).toLocaleDateString("en-IN", {
          dateStyle: "long",
        })}
      </Text>
      <Text style={styles.body}>{summary}</Text>
      {item.source_url && (
        <Pressable onPress={() => Linking.openURL(item.source_url!)}>
          <Text style={styles.link}>View official source →</Text>
        </Pressable>
      )}
      {item.pdf_url && (
        <Pressable onPress={() => Linking.openURL(item.pdf_url!)}>
          <Text style={styles.link}>Open PDF →</Text>
        </Pressable>
      )}
      {item.latitude != null && item.longitude != null && (
        <Pressable
          style={styles.mapBtn}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/map",
              params: { mode: "planning" },
            })
          }
        >
          <Text style={styles.mapBtnText}>View on planning map</Text>
        </Pressable>
      )}
      <ReportMenu kind="news" targetId={id!} />
      <View style={styles.actions}>
        <Pressable style={styles.btn} onPress={toggleSave}>
          <Text style={styles.btnText}>{saved ? "Saved ✓" : "Save"}</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.btnSecondary]}
          onPress={() => Share.share({ message: `${title}\n\n${summary}` })}
        >
          <Text style={[styles.btnText, styles.btnTextSecondary]}>Share</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  badge: { color: colors.primary, fontWeight: "600", marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  date: { color: colors.muted, marginBottom: 16 },
  body: { fontSize: 16, lineHeight: 24, marginBottom: 16 },
  link: { color: colors.primary, fontWeight: "600", marginBottom: 8 },
  mapBtn: {
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
  },
  mapBtnText: { color: colors.primary, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  btn: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  btnText: { color: "#fff", fontWeight: "700" },
  btnTextSecondary: { color: colors.primary },
});
