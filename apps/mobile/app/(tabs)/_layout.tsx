import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "@/constants/theme";

function TabIcon({ label }: { label: string }) {
  return <Text style={{ fontSize: 18 }}>{label}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
      }}
    >
      <Tabs.Screen
        name="news"
        options={{
          title: "News",
          tabBarIcon: () => <TabIcon label="📰" />,
        }}
      />
      <Tabs.Screen
        name="listings"
        options={{
          title: "Properties",
          tabBarIcon: () => <TabIcon label="🏠" />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: () => <TabIcon label="👤" />,
        }}
      />
    </Tabs>
  );
}
