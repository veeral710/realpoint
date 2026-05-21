import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "realpoint_locale";

export type Locale = "en" | "gu";

export async function getLocale(): Promise<Locale> {
  const v = await AsyncStorage.getItem(KEY);
  return v === "gu" ? "gu" : "en";
}

export async function setLocale(locale: Locale) {
  await AsyncStorage.setItem(KEY, locale);
}

export function pickLocalized<T extends string | null | undefined>(
  en: T,
  gu: T,
  locale: Locale
): string {
  if (locale === "gu" && gu) return gu;
  return en ?? "";
}
