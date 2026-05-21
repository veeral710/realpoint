import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DISCLAIMER_TEXT } from "@realpoint/shared";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { colors } from "@/constants/theme";

const DISCLAIMER_KEY = "disclaimer_accepted";

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  async function accept() {
    setLoading(true);
    await AsyncStorage.setItem(DISCLAIMER_KEY, "true");
    if (user) {
      await supabase
        .from("profiles")
        .update({ disclaimer_accepted_at: new Date().toISOString() })
        .eq("id", user.id);
      await refreshProfile();
    }
    setLoading(false);
    router.replace("/(tabs)/news");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>RealPoint</Text>
      <Text style={styles.tagline}>Surat real estate, simplified</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Important disclaimer</Text>
        <Text style={styles.body}>{DISCLAIMER_TEXT}</Text>
      </View>
      <Pressable
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={accept}
        disabled={loading}
      >
        <Text style={styles.btnText}>I understand — continue</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60 },
  logo: { fontSize: 32, fontWeight: "800", color: colors.primary },
  tagline: { fontSize: 16, color: colors.muted, marginBottom: 24 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  cardTitle: { fontWeight: "700", marginBottom: 8, fontSize: 16 },
  body: { color: colors.muted, lineHeight: 22 },
  btn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
