import Constants, { ExecutionEnvironment } from "expo-constants";
import { NativeModules } from "react-native";

/** True when running inside Expo Go (no custom native modules). */
export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

/** MapLibre native module present (requires dev build after adding @maplibre/maplibre-react-native). */
export function isMapLibreNativeAvailable(): boolean {
  if (isExpoGo()) return false;
  const modules = NativeModules as Record<string, unknown>;
  return !!(
    modules.MLRNMapViewModule ||
    modules.MLRNMapModule ||
    modules.MapLibreRNModule
  );
}

export function mapEngineLabel(): "expo-go" | "maplibre" | "legacy" {
  if (isExpoGo()) return "expo-go";
  if (isMapLibreNativeAvailable()) return "maplibre";
  return "legacy";
}

export function needsMapLibreRebuild(): boolean {
  return !isExpoGo() && !isMapLibreNativeAvailable();
}
