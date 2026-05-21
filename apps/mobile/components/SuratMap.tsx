import { SuratMapLegacy, type SuratMapProps } from "./SuratMapLegacy";
import { SuratMapLibre } from "./SuratMapLibre";
import { isExpoGo } from "@/lib/map-engine";

export type { SuratMapProps };

/** MapLibre in dev/production builds; react-native-maps fallback in Expo Go. */
export function SuratMap(props: SuratMapProps) {
  if (isExpoGo()) {
    return <SuratMapLegacy {...props} />;
  }
  return <SuratMapLibre {...props} />;
}
