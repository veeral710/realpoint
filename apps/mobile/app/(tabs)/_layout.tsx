import { Tabs, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Text } from "react-native";
import { TAB_LABELS_GU } from "@realpoint/shared";
import { useAreaNewsBadge } from "@/hooks/useAreaNewsBadge";
import { useLocale } from "@/hooks/useLocale";
import { colors } from "@/constants/theme";

function TabIcon({ label }: { label: string }) {
  return <Text style={{ fontSize: 18 }}>{label}</Text>;
}

export default function TabsLayout() {
  const { isGu, refresh } = useLocale();
  const newsBadge = useAreaNewsBadge();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

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
          title: isGu ? TAB_LABELS_GU.news : "News",
          tabBarBadge: newsBadge,
          tabBarIcon: () => <TabIcon label="📰" />,
        }}
      />
      <Tabs.Screen
        name="listings"
        options={{
          title: isGu ? TAB_LABELS_GU.listings : "Properties",
          tabBarIcon: () => <TabIcon label="🏠" />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: isGu ? TAB_LABELS_GU.map : "Map",
          tabBarIcon: () => <TabIcon label="🗺️" />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: isGu ? TAB_LABELS_GU.account : "Account",
          tabBarIcon: () => <TabIcon label="👤" />,
        }}
      />
    </Tabs>
  );
}
