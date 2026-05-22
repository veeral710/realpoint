import { useCallback, useEffect, useState, type ComponentType } from "react";
import { View, StyleSheet } from "react-native";
import { SuratMapLegacy, type SuratMapProps } from "./SuratMapLegacy";
import { MapEngineBanner } from "./MapEngineBanner";
import { isMapLibreNativeAvailable } from "@/lib/map-engine";

export type { SuratMapProps };

const forceLegacy =
  process.env.EXPO_PUBLIC_FORCE_LEGACY_MAP === "1" ||
  process.env.EXPO_PUBLIC_FORCE_LEGACY_MAP === "true";

type MapLibreProps = SuratMapProps & { onEngineFailed?: () => void };

/** Load MapLibre only when native module exists — static import crashes Expo Go. */
function SuratMapLibreLazy({
  onEngineFailed,
  ...props
}: MapLibreProps) {
  const [Lib, setLib] = useState<ComponentType<MapLibreProps> | null>(null);

  useEffect(() => {
    try {
      const mod = require("./SuratMapLibre") as {
        SuratMapLibre: ComponentType<MapLibreProps>;
      };
      setLib(() => mod.SuratMapLibre);
    } catch {
      onEngineFailed?.();
    }
  }, [onEngineFailed]);

  if (!Lib) return null;
  return <Lib {...props} onEngineFailed={onEngineFailed} />;
}

/**
 * MapLibre when the native module is in the APK; falls back to react-native-maps
 * if MapLibre fails to load tiles or EXPO_PUBLIC_FORCE_LEGACY_MAP=1.
 */
export function SuratMap(props: SuratMapProps) {
  const mapLibreAvailable = isMapLibreNativeAvailable() && !forceLegacy;
  const [engine, setEngine] = useState<"maplibre" | "legacy">(
    mapLibreAvailable ? "maplibre" : "legacy"
  );

  const handleMapLibreFailed = useCallback(() => {
    setEngine("legacy");
  }, []);

  return (
    <View style={styles.root}>
      <MapEngineBanner engine={engine} />
      <View style={styles.mapArea}>
        {engine === "maplibre" ? (
          <SuratMapLibreLazy {...props} onEngineFailed={handleMapLibreFailed} />
        ) : (
          <SuratMapLegacy {...props} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  mapArea: { flex: 1, minHeight: 240 },
});
