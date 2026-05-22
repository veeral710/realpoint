import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "realpoint_map_prefs_v1";

export type MapPrefs = {
  mapMode: "planning" | "listings";
  showTp: boolean;
  showDp: boolean;
  showVillages: boolean;
  showNotices: boolean;
  showFp: boolean;
  satellite: boolean;
};

const DEFAULTS: MapPrefs = {
  mapMode: "planning",
  showTp: true,
  showDp: false,
  showVillages: false,
  showNotices: true,
  showFp: false,
  satellite: false,
};

export async function loadMapPrefs(): Promise<MapPrefs> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export async function saveMapPrefs(prefs: Partial<MapPrefs>): Promise<void> {
  const current = await loadMapPrefs();
  await AsyncStorage.setItem(KEY, JSON.stringify({ ...current, ...prefs }));
}
