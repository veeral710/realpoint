import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import {
  submitDocumentRequest,
  type DocumentRequestType,
} from "@/lib/document-requests";
import { DemoBanner } from "@/components/DemoBanner";
import { colors } from "@/constants/theme";

const TITLES: Record<DocumentRequestType, string> = {
  seven_twelve: "Request 7/12 extract",
  property_card: "Request property card",
};

export default function DocumentRequestScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    type?: string;
    listing?: string;
    scheme?: string;
  }>();

  const requestType: DocumentRequestType =
    params.type === "property_card" ? "property_card" : "seven_twelve";

  const [surveyNumber, setSurveyNumber] = useState("");
  const [villageName, setVillageName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!user) {
      Alert.alert("Login required", "Sign in to submit a document request.");
      router.push("/auth/login");
      return;
    }
    if (!surveyNumber.trim() && !villageName.trim()) {
      Alert.alert("Details needed", "Enter survey number or village/area name.");
      return;
    }

    setLoading(true);
    const { reference_code, error } = await submitDocumentRequest({
      userId: user.id,
      requestType,
      surveyNumber,
      villageName,
      contactPhone,
      notes,
      listingId: typeof params.listing === "string" ? params.listing : undefined,
      tpSchemeId: typeof params.scheme === "string" ? params.scheme : undefined,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Could not submit", error.message);
      return;
    }

    Alert.alert(
      "Request received (demo)",
      `Reference: ${reference_code}\n\nOur partner will contact you within 24–48 hours. This is a mock workflow for testing — not connected to revenue offices yet.`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DemoBanner />
      <Text style={styles.title}>{TITLES[requestType]}</Text>
      <Text style={styles.hint}>
        Demo request flow — data is stored locally for your review. Verify all
        land records with official i-ORA / AnyROR / revenue office before any
        transaction.
      </Text>

      <Text style={styles.label}>Survey number</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 123/1"
        value={surveyNumber}
        onChangeText={setSurveyNumber}
      />

      <Text style={styles.label}>Village / area</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Vesu, Surat"
        value={villageName}
        onChangeText={setVillageName}
      />

      <Text style={styles.label}>Your phone</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        placeholder="+91…"
        value={contactPhone}
        onChangeText={setContactPhone}
      />

      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        multiline
        placeholder="Plot details, seller name, etc."
        value={notes}
        onChangeText={setNotes}
      />

      <Pressable
        style={styles.btn}
        onPress={submit}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading ? "Submitting…" : "Submit request"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 8, color: colors.text },
  hint: { color: colors.muted, lineHeight: 20, marginBottom: 16 },
  label: { fontWeight: "600", marginBottom: 6, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  btn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
