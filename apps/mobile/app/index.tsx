import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/lib/auth";
import { colors } from "@/constants/theme";

const DISCLAIMER_KEY = "disclaimer_accepted";

export default function Index() {
  const { loading, profile } = useAuth();
  const [disclaimerOk, setDisclaimerOk] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(DISCLAIMER_KEY).then((v) =>
      setDisclaimerOk(v === "true")
    );
  }, []);

  if (loading || disclaimerOk === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!disclaimerOk && !profile?.disclaimer_accepted_at) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/news" />;
}
