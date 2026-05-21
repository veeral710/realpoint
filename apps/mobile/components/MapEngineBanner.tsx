import { View, Text, StyleSheet } from "react-native";
import {
  isExpoGo,
  isMapLibreNativeAvailable,
  needsMapLibreRebuild,
} from "@/lib/map-engine";
import { colors } from "@/constants/theme";

export function MapEngineBanner() {
  if (isExpoGo()) {
    return (
      <View style={[styles.banner, styles.warn]}>
        <Text style={styles.text}>
          Expo Go: basic map only. Install the EAS dev build for MapLibre.
        </Text>
      </View>
    );
  }

  if (needsMapLibreRebuild()) {
    return (
      <View style={[styles.banner, styles.warn]}>
        <Text style={styles.title}>MapLibre not in this APK</Text>
        <Text style={styles.text}>
          This dev build was created before MapLibre was added. The app uses the
          standard map for now. Rebuild:{" "}
          <Text style={styles.mono}>eas build -p android --profile development</Text>
        </Text>
      </View>
    );
  }

  if (isMapLibreNativeAvailable()) {
    return (
      <View style={[styles.banner, styles.ok]}>
        <Text style={styles.text}>MapLibre active</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1 },
  warn: {
    backgroundColor: "#fff8e1",
    borderColor: colors.border,
  },
  ok: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.border,
  },
  title: { fontWeight: "700", color: "#7a5c00", marginBottom: 4 },
  text: { fontSize: 12, color: "#5c4a00", lineHeight: 18 },
  mono: { fontFamily: "monospace", fontSize: 11 },
});
