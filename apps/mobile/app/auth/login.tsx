import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { registerForPushNotifications } from "@/lib/push";
import { isLocalDev, DEV_LOGINS } from "@/lib/isLocal";
import {
  DEMO_OTP,
  DEMO_PHONE,
  sendDemoOtp,
  verifyDemoOtp,
} from "@/lib/integrations/mock-otp";
import { DemoBanner } from "@/components/DemoBanner";
import { colors } from "@/constants/theme";

type LoginMode = "email" | "phone";

export default function LoginScreen() {
  const router = useRouter();
  const local = isLocalDev();
  const [mode, setMode] = useState<LoginMode>("email");
  const [email, setEmail] = useState<string>(DEV_LOGINS[0].email);
  const [password, setPassword] = useState<string>(DEV_LOGINS[0].password);
  const [phone, setPhone] = useState(DEMO_PHONE.replace("+91", ""));
  const [otp, setOtp] = useState(DEMO_OTP);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function signInPassword() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert("Login failed", error.message);
      return;
    }
    if (data.user) {
      await registerForPushNotifications(data.user.id);
    }
    router.back();
  }

  async function sendOtp() {
    setLoading(true);
    const { error } = await sendDemoOtp(phone);
    setLoading(false);
    if (error) {
      Alert.alert("OTP failed", error.message);
      return;
    }
    setOtpSent(true);
    Alert.alert("Demo OTP", `Use code ${DEMO_OTP} (local Supabase test OTP).`);
  }

  async function verifyOtp() {
    setLoading(true);
    const { data, error } = await verifyDemoOtp(phone, otp.trim());
    setLoading(false);
    if (error) {
      Alert.alert("Verify failed", error.message);
      return;
    }
    if (data.user) {
      await registerForPushNotifications(data.user.id);
    }
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DemoBanner />
      <Text style={styles.title}>Login</Text>
      {local ? (
        <>
          <View style={styles.modeRow}>
            <Pressable
              style={[styles.modeChip, mode === "email" && styles.modeChipOn]}
              onPress={() => setMode("email")}
            >
              <Text
                style={
                  mode === "email" ? styles.modeChipOnText : styles.modeChipText
                }
              >
                Email
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeChip, mode === "phone" && styles.modeChipOn]}
              onPress={() => setMode("phone")}
            >
              <Text
                style={
                  mode === "phone" ? styles.modeChipOnText : styles.modeChipText
                }
              >
                Phone (demo OTP)
              </Text>
            </Pressable>
          </View>

          {mode === "email" ? (
            <>
              <Text style={styles.hint}>
                Demo accounts (password for all: realpoint123)
              </Text>
              <View style={styles.pickerRow}>
                {DEV_LOGINS.map((d) => (
                  <Pressable
                    key={d.email}
                    style={[
                      styles.pickerChip,
                      email === d.email && styles.pickerChipOn,
                    ]}
                    onPress={() => {
                      setEmail(d.email);
                      setPassword(d.password);
                    }}
                  >
                    <Text
                      style={
                        email === d.email
                          ? styles.pickerChipOnText
                          : styles.pickerChipText
                      }
                    >
                      {d.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                style={styles.btn}
                onPress={signInPassword}
                disabled={loading}
              >
                <Text style={styles.btnText}>
                  {loading ? "Signing in…" : "Sign in"}
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.hint}>
                Local Supabase accepts test OTP {DEMO_OTP} for demo numbers
                (see config.toml).
              </Text>
              <Text style={styles.label}>Phone (10 digits)</Text>
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                placeholder="9876543210"
              />
              {!otpSent ? (
                <Pressable style={styles.btn} onPress={sendOtp} disabled={loading}>
                  <Text style={styles.btnText}>Send OTP</Text>
                </Pressable>
              ) : (
                <>
                  <Text style={styles.label}>OTP</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={otp}
                    onChangeText={setOtp}
                    maxLength={6}
                  />
                  <Pressable
                    style={styles.btn}
                    onPress={verifyOtp}
                    disabled={loading}
                  >
                    <Text style={styles.btnText}>Verify & sign in</Text>
                  </Pressable>
                </>
              )}
            </>
          )}
        </>
      ) : (
        <Text style={styles.hint}>
          Phone OTP will be enabled in production. Use cloud build for full auth.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  hint: { color: colors.muted, marginBottom: 12, lineHeight: 22 },
  modeRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  modeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  modeChipOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  modeChipText: { fontSize: 13, color: colors.muted },
  modeChipOnText: { fontSize: 13, color: colors.primary, fontWeight: "600" },
  pickerRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  pickerChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pickerChipOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  pickerChipText: { fontSize: 13, color: colors.muted },
  pickerChipOnText: { fontSize: 13, color: colors.primary, fontWeight: "600" },
  label: { fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  btn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
