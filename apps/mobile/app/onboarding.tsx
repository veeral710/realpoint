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
import { DISCLAIMER_TEXT, ONBOARDING_AREAS } from "@realpoint/shared";
import { useAuth } from "@/lib/auth";
import { saveAreaInterests } from "@/lib/area-interests";
import { colors } from "@/constants/theme";

const DISCLAIMER_KEY = "disclaimer_accepted";

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  function toggleArea(area: string) {
    setSelected((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  async function finish(areas: string[]) {
    setLoading(true);
    await AsyncStorage.setItem(DISCLAIMER_KEY, "true");
    await saveAreaInterests(areas, user?.id ?? null);
    if (user) {
      await refreshProfile();
    }
    setLoading(false);
    router.replace("/(tabs)/news");
  }

  async function acceptDisclaimer() {
    setStep(2);
  }

  if (step === 1) {
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
          onPress={acceptDisclaimer}
          disabled={loading}
        >
          <Text style={styles.btnText}>I understand — continue</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>Your areas</Text>
      <Text style={styles.tagline}>
        Pick Surat areas you care about. News will default to these filters.
      </Text>
      <View style={styles.chips}>
        {ONBOARDING_AREAS.map((area) => {
          const on = selected.includes(area);
          return (
            <Pressable
              key={area}
              style={[styles.chip, on && styles.chipOn]}
              onPress={() => toggleArea(area)}
            >
              <Text style={[styles.chipText, on && styles.chipOnText]}>
                {area}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={() => finish(selected)}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {selected.length ? "Continue" : "Skip for now"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60 },
  logo: { fontSize: 28, fontWeight: "800", color: colors.primary },
  tagline: { fontSize: 15, color: colors.muted, marginBottom: 20, lineHeight: 22 },
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
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 28 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipText: { fontSize: 15, color: colors.text },
  chipOnText: { color: colors.primary, fontWeight: "600" },
  btn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
