import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
import type { SuratMapProps } from "./SuratMapLegacy";

/** Maps are native-only (MapLibre / react-native-maps). Use the mobile dev build. */
export function SuratMap(_props: SuratMapProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Map</Text>
      <Text style={styles.body}>
        The Surat planning map runs on the Android or iOS app. Open this project
        in the RealPoint dev build or Expo Go on a device — not in the browser.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.bg,
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 8 },
  body: { color: colors.muted, lineHeight: 22 },
});
