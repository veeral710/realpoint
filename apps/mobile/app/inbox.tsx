import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { DemoBanner } from "@/components/DemoBanner";
import { colors } from "@/constants/theme";

type InquiryRow = {
  id: string;
  message: string;
  contact_phone: string | null;
  created_at: string;
  listing_id: string;
  listings: { id: string; title: string; intent: string };
};

export default function InboxScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: myListings } = await supabase
      .from("listings")
      .select("id")
      .eq("user_id", user.id);

    const ids = (myListings ?? []).map((l) => l.id);
    if (ids.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("listing_inquiries")
      .select(
        "id, message, contact_phone, created_at, listing_id, listings(id, title, intent)"
      )
      .in("listing_id", ids)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) {
      setItems([]);
    } else {
      setItems(
        data.map((row) => {
          const raw = row.listings as
            | { id: string; title: string; intent: string }
            | { id: string; title: string; intent: string }[]
            | null;
          const listing = Array.isArray(raw) ? raw[0] : raw;
          return {
            id: row.id,
            message: row.message,
            contact_phone: row.contact_phone,
            created_at: row.created_at,
            listing_id: row.listing_id,
            listings: listing ?? { id: row.listing_id, title: "Listing", intent: "—" },
          };
        })
      );
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Login to view inquiries on your listings.</Text>
        <Pressable style={styles.btn} onPress={() => router.push("/auth/login")}>
          <Text style={styles.btnText}>Login</Text>
        </Pressable>
      </View>
    );
  }

  const header = (
    <View>
      <DemoBanner />
      <Text style={styles.hint}>
        Messages from buyers on your properties (demo inquiries seeded for admin).
      </Text>
    </View>
  );

  return (
    <FlatList
      style={styles.list}
      data={items}
      keyExtractor={(i) => i.id}
      ListHeaderComponent={header}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={load} />
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => router.push(`/listings/${item.listing_id}`)}
        >
          <Text style={styles.listingTitle}>{item.listings?.title ?? "Listing"}</Text>
          <Text style={styles.meta}>
            {item.listings?.intent?.toUpperCase() ?? "—"} ·{" "}
            {new Date(item.created_at).toLocaleString("en-IN")}
          </Text>
          <Text style={styles.message}>{item.message}</Text>
          {item.contact_phone ? (
            <Text style={styles.phone}>Phone: {item.contact_phone}</Text>
          ) : null}
        </Pressable>
      )}
      ListEmptyComponent={
        !loading ? (
          <Text style={styles.empty}>
            No inquiries yet. Log in as admin@realpoint.local (listing owner) after
            pnpm seed:m2, or post a listing and inquire as buyer.
          </Text>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: "center", padding: 24 },
  hint: { padding: 16, color: colors.muted, lineHeight: 20 },
  card: {
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listingTitle: { fontWeight: "700", color: colors.text },
  meta: { fontSize: 12, color: colors.muted, marginTop: 4 },
  message: { marginTop: 8, lineHeight: 20, color: colors.text },
  phone: { marginTop: 6, color: colors.primary, fontWeight: "600" },
  empty: { textAlign: "center", padding: 24, color: colors.muted },
  muted: { color: colors.muted, textAlign: "center", marginBottom: 16 },
  btn: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
