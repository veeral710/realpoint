import { Stack } from "expo-router";
import { colors } from "@/constants/theme";

export default function MapsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="directory" options={{ title: "TP schemes" }} />
      <Stack.Screen name="[id]" options={{ title: "Scheme" }} />
    </Stack>
  );
}
