import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import {
  LISTING_INTENTS,
  PROPERTY_CLASSES,
  PROPERTY_CLASS_LABELS,
  AREA_UNITS,
  type Locality,
  type TpScheme,
} from "@realpoint/shared";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { colors } from "@/constants/theme";

export default function CreateListingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [tpSchemes, setTpSchemes] = useState<TpScheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    intent: "sell" as string,
    property_class: "plot" as string,
    title: "",
    description: "",
    price: "",
    price_negotiable: true,
    area_value: "",
    area_unit: "sqyd",
    locality_id: "",
    tp_scheme_id: "",
    contact_phone: "",
    contact_whatsapp: "",
    na_status: "",
    bhk: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("localities")
      .select("*")
      .eq("district", "Surat")
      .order("sort_order")
      .then(({ data }) => setLocalities((data as Locality[]) ?? []));
    supabase
      .from("tp_schemes")
      .select("id, scheme_number, name, status, taluka, area_name, center_lat, center_lng, overlay_color, sort_order, is_published, authority, district, name_gu, description, source_url, pdf_url")
      .eq("is_published", true)
      .order("sort_order")
      .then(({ data }) => setTpSchemes((data as TpScheme[]) ?? []));
  }, [user]);

  async function captureLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Location permission",
        "Allow location access to pin your listing on the map."
      );
      return;
    }
    setLoading(true);
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setForm({
        ...form,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch {
      Alert.alert("Location error", "Could not get GPS fix. Try again outdoors.");
    } finally {
      setLoading(false);
    }
  }

  async function pickImages() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages(result.assets.map((a) => a.uri));
    }
  }

  async function submit(publish: boolean) {
    if (!user) {
      Alert.alert("Login required", "Sign in to post a listing.", [
        { text: "Login", onPress: () => router.push("/auth/login") },
      ]);
      return;
    }
    if (!form.title.trim()) {
      Alert.alert("Title required");
      return;
    }

    setLoading(true);
    const payload = {
      user_id: user.id,
      intent: form.intent,
      property_class: form.property_class,
      title: form.title.trim(),
      description: form.description || null,
      price: form.price ? parseFloat(form.price) : null,
      price_negotiable: form.price_negotiable,
      area_value: form.area_value ? parseFloat(form.area_value) : null,
      area_unit: form.area_value ? form.area_unit : null,
      locality_id: form.locality_id || null,
      tp_scheme_id: form.tp_scheme_id || null,
      latitude: form.latitude,
      longitude: form.longitude,
      contact_phone: form.contact_phone || null,
      contact_whatsapp: form.contact_whatsapp || null,
      na_status: form.na_status || null,
      bhk: form.bhk ? parseInt(form.bhk, 10) : null,
      status: publish ? "published" : "draft",
    };

    const { data: listing, error } = await supabase
      .from("listings")
      .insert(payload)
      .select("id")
      .single();

    if (error || !listing) {
      setLoading(false);
      Alert.alert("Error", error?.message ?? "Failed to create");
      return;
    }

    for (let i = 0; i < images.length; i++) {
      const uri = images[i];
      const ext = uri.split(".").pop() ?? "jpg";
      const path = `${user.id}/${listing.id}/${i}.${ext}`;
      const response = await fetch(uri);
      const blob = await response.blob();
      await supabase.storage.from("listing-images").upload(path, blob, {
        contentType: `image/${ext}`,
        upsert: true,
      });
      await supabase.from("listing_media").insert({
        listing_id: listing.id,
        storage_path: path,
        sort_order: i,
      });
    }

    setLoading(false);
    Alert.alert(
      "Success",
      publish
        ? "Listing published!"
        : "Draft saved. An admin must publish it before others see it on the feed."
    );
    router.replace(publish ? `/listings/${listing.id}` : "/(tabs)/listings");
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Intent</Text>
      <View style={styles.row}>
        {LISTING_INTENTS.map((i) => (
          <Pressable
            key={i}
            style={[styles.chip, form.intent === i && styles.chipOn]}
            onPress={() => setForm({ ...form, intent: i })}
          >
            <Text style={form.intent === i ? styles.chipOnText : undefined}>
              {i}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Property type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {PROPERTY_CLASSES.map((c) => (
          <Pressable
            key={c}
            style={[styles.chip, form.property_class === c && styles.chipOn]}
            onPress={() => setForm({ ...form, property_class: c })}
          >
            <Text
              style={form.property_class === c ? styles.chipOnText : undefined}
            >
              {PROPERTY_CLASS_LABELS[c]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        value={form.title}
        onChangeText={(t) => setForm({ ...form, title: t })}
      />
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        multiline
        value={form.description}
        onChangeText={(t) => setForm({ ...form, description: t })}
      />
      <Text style={styles.label}>Price (₹)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form.price}
        onChangeText={(t) => setForm({ ...form, price: t })}
      />
      <View style={styles.switchRow}>
        <Text>Negotiable</Text>
        <Switch
          value={form.price_negotiable}
          onValueChange={(v) => setForm({ ...form, price_negotiable: v })}
        />
      </View>
      <Text style={styles.label}>Area</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          keyboardType="numeric"
          placeholder="Value"
          value={form.area_value}
          onChangeText={(t) => setForm({ ...form, area_value: t })}
        />
        <View style={{ width: 8 }} />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={form.area_unit}
          onChangeText={(t) => setForm({ ...form, area_unit: t })}
        />
      </View>
      <Text style={styles.label}>Locality</Text>
      <ScrollView horizontal style={{ marginBottom: 12 }}>
        {localities.map((loc) => (
          <Pressable
            key={loc.id}
            style={[
              styles.chip,
              form.locality_id === loc.id && styles.chipOn,
            ]}
            onPress={() => setForm({ ...form, locality_id: loc.id })}
          >
            <Text
              style={
                form.locality_id === loc.id ? styles.chipOnText : undefined
              }
            >
              {loc.area_name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={styles.label}>TP scheme (optional)</Text>
      <ScrollView horizontal style={{ marginBottom: 12 }}>
        <Pressable
          style={[styles.chip, !form.tp_scheme_id && styles.chipOn]}
          onPress={() => setForm({ ...form, tp_scheme_id: "" })}
        >
          <Text style={!form.tp_scheme_id ? styles.chipOnText : undefined}>
            None
          </Text>
        </Pressable>
        {tpSchemes.map((scheme) => (
          <Pressable
            key={scheme.id}
            style={[
              styles.chip,
              form.tp_scheme_id === scheme.id && styles.chipOn,
            ]}
            onPress={() => setForm({ ...form, tp_scheme_id: scheme.id })}
          >
            <Text
              style={
                form.tp_scheme_id === scheme.id ? styles.chipOnText : undefined
              }
            >
              {scheme.scheme_number}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={styles.label}>Map location</Text>
      <Text style={styles.hint}>
        Optional. Pin the property on the Surat map for buyers.
      </Text>
      {form.latitude != null && form.longitude != null ? (
        <Text style={styles.coords}>
          {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
        </Text>
      ) : (
        <Text style={styles.hint}>No GPS set — approximate pin may be used.</Text>
      )}
      <View style={styles.row}>
        <Pressable
          style={[styles.secondaryBtn, { flex: 1 }]}
          onPress={captureLocation}
          disabled={loading}
        >
          <Text style={styles.secondaryBtnText}>Use current location</Text>
        </Pressable>
        {form.latitude != null && (
          <Pressable
            style={styles.clearLoc}
            onPress={() =>
              setForm({ ...form, latitude: null, longitude: null })
            }
          >
            <Text style={styles.clearLocText}>Clear</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.label}>Contact phone</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        value={form.contact_phone}
        onChangeText={(t) => setForm({ ...form, contact_phone: t })}
      />
      <Text style={styles.label}>WhatsApp</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        value={form.contact_whatsapp}
        onChangeText={(t) => setForm({ ...form, contact_whatsapp: t })}
      />
      <Pressable style={styles.secondaryBtn} onPress={pickImages}>
        <Text style={styles.secondaryBtnText}>
          Add photos ({images.length})
        </Text>
      </Pressable>
      <Pressable
        style={styles.btn}
        onPress={() => submit(true)}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading ? "Publishing…" : "Publish listing"}
        </Text>
      </Pressable>
      <Pressable
        style={[styles.btn, styles.draftBtn]}
        onPress={() => submit(false)}
        disabled={loading}
      >
        <Text style={[styles.btnText, { color: colors.primary }]}>
          Save draft
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { fontWeight: "600", marginBottom: 6, marginTop: 8 },
  hint: { color: colors.muted, fontSize: 12, marginBottom: 6 },
  coords: { color: colors.primary, fontWeight: "600", marginBottom: 8 },
  clearLoc: { padding: 14, justifyContent: "center" },
  clearLocText: { color: colors.danger, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  chipOn: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipOnText: { color: colors.primary, fontWeight: "600" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  btn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  draftBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary },
  btnText: { color: "#fff", fontWeight: "700" },
  secondaryBtn: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    marginBottom: 8,
  },
  secondaryBtnText: { color: colors.primary, fontWeight: "600" },
});
