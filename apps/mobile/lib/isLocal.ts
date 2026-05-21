import Constants from "expo-constants";

export function isLocalDev(): boolean {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
  if (url.includes("127.0.0.1") || url.includes("localhost")) return true;
  if (__DEV__ && !url.includes("supabase.co")) return true;
  return false;
}

export const DEV_LOGIN = {
  email: "admin@realpoint.local",
  password: "realpoint123",
};
