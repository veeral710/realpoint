import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getLocale, setLocale, type Locale } from "@/lib/i18n";
import { registerForPushNotifications } from "@/lib/push";
import { USER_ROLES } from "@realpoint/shared";
import { colors } from "@/constants/theme";

export default function AccountScreen() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [locale, setLocaleState] = useState<Locale>("en");
  const [guEnabled, setGuEnabled] = useState(false);

  useEffect(() => {
    getLocale().then((l) => {
      setLocaleState(l);
      setGuEnabled(l === "gu");
    });
  }, []);

  async function toggleGujarati(v: boolean) {
    const l: Locale = v ? "gu" : "en";
    await setLocale(l);
    setLocaleState(l);
    setGuEnabled(v);
  }

  async function updateRole(role: string) {
    if (!user) return;
    await supabase.from("profiles").update({ role }).eq("id", user.id);
    await refreshProfile();
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/(tabs)/news");
  }

  async function enablePush() {
    if (!user) {
      Alert.alert("Login required");
      return;
    }
    await registerForPushNotifications(user.id);
    Alert.alert("Push enabled", "You will receive updates on new circulars.");
  }

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.phone}>{profile?.phone ?? user.phone}</Text>
          <Text style={styles.role}>Role: {profile?.role ?? "buyer"}</Text>
          <Text style={styles.section}>I am a</Text>
          <View style={styles.row}>
            {USER_ROLES.map((r) => (
              <Pressable
                key={r}
                style={[
                  styles.chip,
                  profile?.role === r && styles.chipOn,
                ]}
                onPress={() => updateRole(r)}
              >
                <Text
                  style={
                    profile?.role === r ? styles.chipOnText : undefined
                  }
                >
                  {r}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.switchRow}>
            <Text>Gujarati content</Text>
            <Switch value={guEnabled} onValueChange={toggleGujarati} />
          </View>
          <Pressable style={styles.link} onPress={() => router.push("/saved")}>
            <Text style={styles.linkText}>Saved items →</Text>
          </Pressable>
          <Pressable style={styles.link} onPress={enablePush}>
            <Text style={styles.linkText}>Enable push notifications</Text>
          </Pressable>
          <Pressable style={styles.btnOutline} onPress={signOut}>
            <Text style={styles.btnOutlineText}>Sign out</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.hint}>
            Sign in to save news, post listings, and send inquiries.
          </Text>
          <Pressable
            style={styles.btn}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.btnText}>Login with phone</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  phone: { fontSize: 18, fontWeight: "700" },
  role: { color: colors.muted, marginBottom: 16 },
  section: { fontWeight: "600", marginBottom: 8 },
  row: { flexDirection: "row", gap: 8, marginBottom: 20 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipOnText: { color: colors.primary, fontWeight: "600" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  link: { paddingVertical: 12 },
  linkText: { color: colors.primary, fontWeight: "600", fontSize: 16 },
  btn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
  btnOutline: {
    marginTop: 24,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: "center",
  },
  btnOutlineText: { color: colors.danger, fontWeight: "600" },
  hint: { color: colors.muted, marginBottom: 20 },
});
