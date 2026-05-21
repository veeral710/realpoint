import { View, StyleSheet } from "react-native";
import { SuratMapLegacy, type SuratMapProps } from "./SuratMapLegacy";
import { SuratMapLibre } from "./SuratMapLibre";
import { MapEngineBanner } from "./MapEngineBanner";
import { isMapLibreNativeAvailable } from "@/lib/map-engine";

export type { SuratMapProps };

/**
 * MapLibre when the native module is in the APK; otherwise react-native-maps
 * (works in Expo Go and older dev builds).
 */
export function SuratMap(props: SuratMapProps) {
  const useMapLibre = isMapLibreNativeAvailable();

  return (
    <View style={styles.root}>
      <MapEngineBanner />
      <View style={styles.mapArea}>
        {useMapLibre ? (
          <SuratMapLibre {...props} />
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
