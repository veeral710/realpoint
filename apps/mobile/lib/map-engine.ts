import Constants, { ExecutionEnvironment } from "expo-constants";

/** True when running inside Expo Go (no MapLibre native module). */
export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

export function mapEngineLabel(): string {
  return isExpoGo() ? "basic" : "maplibre";
}
