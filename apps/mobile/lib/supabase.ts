import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";

/** Metro dev server host (same IP as exp://192.168.x.x:8082 in terminal) */
function getMetroLanHost(): string | null {
  if (process.env.EXPO_PUBLIC_SUPABASE_LAN_URL) {
    try {
      return new URL(process.env.EXPO_PUBLIC_SUPABASE_LAN_URL).hostname;
    } catch {
      return null;
    }
  }

  const fromHostUri = Constants.expoConfig?.hostUri?.split(":")[0];
  if (
    fromHostUri &&
    fromHostUri !== "localhost" &&
    fromHostUri !== "127.0.0.1"
  ) {
    return fromHostUri;
  }

  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    (Constants as { manifest?: { debuggerHost?: string } }).manifest
      ?.debuggerHost;

  if (debuggerHost) {
    const host = debuggerHost.split(":")[0];
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return host;
    }
  }

  return null;
}

function resolveSupabaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";

  if (process.env.EXPO_PUBLIC_SUPABASE_LAN_URL) {
    return process.env.EXPO_PUBLIC_SUPABASE_LAN_URL;
  }

  if (!__DEV__) return fromEnv;

  const isLocalhost =
    fromEnv.includes("127.0.0.1") || fromEnv.includes("localhost");
  if (!isLocalhost) return fromEnv;

  const lanHost = getMetroLanHost();
  if (lanHost) {
    return `http://${lanHost}:54321`;
  }

  if (Platform.OS === "android" && !Constants.isDevice) {
    return "http://10.0.2.2:54321";
  }

  return fromEnv;
}

const url = resolveSupabaseUrl();
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (__DEV__) {
  console.log("[RealPoint] Supabase URL:", url);
  if (url.includes("127.0.0.1") && Constants.isDevice) {
    console.warn(
      "[RealPoint] Physical device cannot use 127.0.0.1. Set EXPO_PUBLIC_SUPABASE_LAN_URL=http://YOUR_MAC_IP:54321 in apps/mobile/.env"
    );
  }
}

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
