import { useCallback, useEffect, useState } from "react";
import { getLocale, setLocale, type Locale } from "@/lib/i18n";

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    getLocale().then(setLocaleState);
  }, []);

  const updateLocale = useCallback(async (next: Locale) => {
    await setLocale(next);
    setLocaleState(next);
  }, []);

  const refresh = useCallback(() => {
    getLocale().then(setLocaleState);
  }, []);

  return { locale, setLocale: updateLocale, refresh, isGu: locale === "gu" };
}
