import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ONBOARDING_AREAS } from "@realpoint/shared";
import { useAuth } from "@/lib/auth";
import {
  getAreaInterests,
  saveAreaInterests,
} from "@/lib/area-interests";
import { colors } from "@/constants/theme";

export default function AreasScreen() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fromProfile = profile?.area_interests?.filter(Boolean);
    if (fromProfile?.length) {
      setSelected(fromProfile);
      return;
    }
    getAreaInterests().then(setSelected);
  }, [profile?.area_interests]);

  function toggle(area: string) {
    setSelected((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  async function save() {
    setSaving(true);
    await saveAreaInterests(selected, user?.id ?? null);
    await refreshProfile();
    setSaving(false);
    Alert.alert("Saved", "Your area preferences were updated.");
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>
        News filters and alerts use these areas (demo counts from recent sample
        news).
      </Text>
      <View style={styles.chips}>
        {ONBOARDING_AREAS.map((area) => {
          const on = selected.includes(area);
          return (
            <Pressable
              key={area}
              style={[styles.chip, on && styles.chipOn]}
              onPress={() => toggle(area)}
            >
              <Text style={[styles.chipText, on && styles.chipOnText]}>
                {area}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        style={[styles.btn, saving && styles.btnDisabled]}
        onPress={save}
        disabled={saving}
      >
        <Text style={styles.btnText}>Save areas</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  hint: { color: colors.muted, marginBottom: 16, lineHeight: 20 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipText: { fontSize: 15 },
  chipOnText: { color: colors.primary, fontWeight: "600" },
  btn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "700" },
});
