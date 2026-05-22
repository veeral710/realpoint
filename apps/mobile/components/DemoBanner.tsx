import { View, Text, StyleSheet } from "react-native";
import { DEMO_BANNER_TEXT } from "@realpoint/shared";
import { colors } from "@/constants/theme";

const hideBanner =
  process.env.EXPO_PUBLIC_DEMO_MODE === "clean" ||
  process.env.EXPO_PUBLIC_DEMO_MODE === "screenshot";

export function DemoBanner() {
  if (hideBanner) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{DEMO_BANNER_TEXT}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#fff8e1",
    borderBottomWidth: 1,
    borderBottomColor: "#ffe082",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  text: {
    fontSize: 12,
    color: "#7a5c00",
    lineHeight: 16,
  },
});
