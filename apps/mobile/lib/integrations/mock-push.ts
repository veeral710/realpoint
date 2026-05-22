import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEMO_PUSH_KEY = "realpoint_demo_push_on";

export async function isDemoPushEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(DEMO_PUSH_KEY)) === "1";
}

/** Local notification demo — no Expo push server required. */
export async function enableDemoPushAlerts(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("demo", {
      name: "Demo alerts",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    Alert.alert(
      "Permission needed",
      "Allow notifications to see demo alerts for new Surat notices."
    );
    return false;
  }

  await AsyncStorage.setItem(DEMO_PUSH_KEY, "1");

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "[Demo] New notice in Vesu",
      body: "Sample SUDA-style update — tap News to read (not a real govt alert).",
      data: { demo: true },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
    },
  });

  Alert.alert(
    "Demo alerts on",
    "A sample notification will appear in a few seconds. Real push uses Expo in production."
  );
  return true;
}
