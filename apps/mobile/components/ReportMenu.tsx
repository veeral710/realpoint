import { Alert, Pressable, Text, StyleSheet } from "react-native";
import { REPORT_REASONS } from "@realpoint/shared";
import { useAuth } from "@/lib/auth";
import { reportListing, reportNews } from "@/lib/reports";
import { colors } from "@/constants/theme";

export function ReportMenu({
  kind,
  targetId,
}: {
  kind: "listing" | "news";
  targetId: string;
}) {
  const { user } = useAuth();

  function openReport() {
    if (!user) {
      Alert.alert("Login required", "Sign in to report content.");
      return;
    }

    Alert.alert(
      "Report content",
      "Select a reason (demo — saved for admin review):",
      [
        ...REPORT_REASONS.map((reason) => ({
          text: reason,
          onPress: async () => {
            const { error } =
              kind === "listing"
                ? await reportListing(targetId, reason, user.id)
                : await reportNews(targetId, reason, user.id);
            if (error) Alert.alert("Error", error.message);
            else Alert.alert("Thank you", "Report submitted (demo).");
          },
        })),
        { text: "Cancel", style: "cancel" },
      ]
    );
  }

  return (
    <Pressable style={styles.btn} onPress={openReport}>
      <Text style={styles.text}>Report</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    marginTop: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  text: { color: colors.muted, fontWeight: "600" },
});
