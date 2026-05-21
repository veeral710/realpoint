import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  StyleSheet,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  PROPERTY_CLASS_LABELS,
  type Listing,
} from "@realpoint/shared";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { colors } from "@/constants/theme";

type ListingDetail = Listing & {
  localities?: { area_name: string; taluka: string | null } | null;
  listing_media?: { storage_path: string }[];
};

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [item, setItem] = useState<ListingDetail | null>(null);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    supabase
      .from("listings")
      .select("*, localities(area_name, taluka), listing_media(storage_path)")
      .eq("id", id)
      .single()
      .then(({ data }) => setItem(data as ListingDetail | null));
  }, [id]);

  async function sendInquiry() {
    if (!user) {
      Alert.alert("Login required", "Sign in to send an inquiry.");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Message required");
      return;
    }
    const { error } = await supabase.from("listing_inquiries").insert({
      listing_id: id,
      user_id: user.id,
      message: message.trim(),
      contact_phone: phone || null,
    });
    if (error) Alert.alert("Error", error.message);
    else {
      Alert.alert("Sent", "Your inquiry was sent to the owner.");
      setMessage("");
    }
  }

  function contactWhatsApp() {
    const num = item?.contact_whatsapp ?? item?.contact_phone;
    if (!num) {
      Alert.alert("No contact", "Owner did not provide WhatsApp.");
      return;
    }
    const clean = num.replace(/\D/g, "");
    Linking.openURL(`https://wa.me/${clean}?text=${encodeURIComponent(`Hi, interested in: ${item?.title}`)}`);
  }

  function contactCall() {
    const num = item?.contact_phone;
    if (!num) {
      Alert.alert("No contact");
      return;
    }
    Linking.openURL(`tel:${num}`);
  }

  if (!item) {
    return (
      <View style={styles.centered}>
        <Text>Loading…</Text>
      </View>
    );
  }

  const baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const mediaUrls = (item.listing_media ?? []).map(
    (m) =>
      `${baseUrl}/storage/v1/object/public/listing-images/${m.storage_path}`
  );

  return (
    <ScrollView style={styles.container}>
      {mediaUrls.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {mediaUrls.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.image} />
          ))}
        </ScrollView>
      )}
      <Text style={styles.badge}>
        {item.intent.toUpperCase()} · {PROPERTY_CLASS_LABELS[item.property_class]}
      </Text>
      <Text style={styles.title}>{item.title}</Text>
      {item.localities && (
        <Text style={styles.loc}>
          {item.localities.area_name}
          {item.localities.taluka ? `, ${item.localities.taluka}` : ""}, Surat
        </Text>
      )}
      <Text style={styles.price}>
        {item.price
          ? `₹${Number(item.price).toLocaleString("en-IN")}`
          : "Price on request"}
      </Text>
      {item.description && (
        <Text style={styles.body}>{item.description}</Text>
      )}
      <View style={styles.meta}>
        {item.area_value && (
          <Text>
            Area: {item.area_value} {item.area_unit ?? ""}
          </Text>
        )}
        {item.bhk && <Text>BHK: {item.bhk}</Text>}
        {item.na_status && <Text>NA: {item.na_status}</Text>}
        {item.zone_name && <Text>Zone: {item.zone_name}</Text>}
      </View>
      <View style={styles.row}>
        <Pressable style={styles.btn} onPress={contactCall}>
          <Text style={styles.btnText}>Call</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnWa]} onPress={contactWhatsApp}>
          <Text style={styles.btnText}>WhatsApp</Text>
        </Pressable>
      </View>
      <Text style={styles.section}>Send inquiry</Text>
      <TextInput
        style={styles.input}
        placeholder="Your message"
        value={message}
        onChangeText={setMessage}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Your phone (optional)"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <Pressable style={styles.btn} onPress={sendInquiry}>
        <Text style={styles.btnText}>Send inquiry</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: 280, height: 180, borderRadius: 10, marginRight: 8 },
  badge: { color: colors.primary, fontWeight: "600", marginTop: 12 },
  title: { fontSize: 22, fontWeight: "800", marginTop: 4 },
  loc: { color: colors.muted },
  price: { fontSize: 18, fontWeight: "700", marginVertical: 8 },
  body: { lineHeight: 22, marginBottom: 12 },
  meta: { gap: 4, marginBottom: 16 },
  row: { flexDirection: "row", gap: 10 },
  btn: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  btnWa: { backgroundColor: "#25D366" },
  btnText: { color: "#fff", fontWeight: "700" },
  section: { fontWeight: "700", marginTop: 16, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: colors.surface,
  },
});
