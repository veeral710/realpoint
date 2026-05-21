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
import { isLocalDev, DEV_LOGIN } from "@/lib/isLocal";
import { colors } from "@/constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const local = isLocalDev();
  const [email, setEmail] = useState(DEV_LOGIN.email);
  const [password, setPassword] = useState(DEV_LOGIN.password);
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Login</Text>
      {local ? (
        <>
          <Text style={styles.hint}>
            Local dev: use the same admin account as web.
          </Text>
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
  hint: { color: colors.muted, marginBottom: 16, lineHeight: 22 },
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
