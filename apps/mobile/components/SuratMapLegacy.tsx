import { useEffect, useMemo, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import MapView, { Marker, Polygon, PROVIDER_DEFAULT } from "react-native-maps";
import type {
  TpSchemeMap,
  MapOverlay,
  VillageMap,
  MapListingPin,
} from "@realpoint/shared";
import { SURAT_MAP_CENTER } from "@realpoint/shared";
import {
  tpSchemesToPolygons,
  overlaysToPolygons,
  villagesToPolygons,
  intentPinColor,
  type LatLng,
  type MapPolygon,
} from "@/lib/maps";

export type SuratMapProps = {
  schemes: TpSchemeMap[];
  dpOverlays?: MapOverlay[];
  fpOverlays?: MapOverlay[];
  villages?: VillageMap[];
  listings?: MapListingPin[];
  showTpOverlay: boolean;
  showDpOverlay?: boolean;
  showFpOverlay?: boolean;
  showVillageOverlay?: boolean;
  showListings?: boolean;
  showTpMarkers?: boolean;
  tpOpacity: number;
  overlayOpacity?: number;
  mapType: "standard" | "satellite" | "hybrid";
  selectedSchemeId?: string | null;
  selectedListingId?: string | null;
  focusCenter?: LatLng | null;
  onSchemePress?: (schemeId: string) => void;
  onListingPress?: (listingId: string) => void;
};

export function SuratMapLegacy({
  schemes,
  dpOverlays = [],
  fpOverlays = [],
  villages = [],
  listings = [],
  showTpOverlay,
  showDpOverlay = false,
  showFpOverlay = false,
  showVillageOverlay = false,
  showListings = false,
  showTpMarkers = true,
  tpOpacity,
  overlayOpacity = 0.35,
  mapType,
  selectedSchemeId,
  focusCenter,
  onSchemePress,
  onListingPress,
}: SuratMapProps) {
  const mapRef = useRef<MapView>(null);

  const tpPolygons = useMemo(
    () => (showTpOverlay ? tpSchemesToPolygons(schemes, tpOpacity) : []),
    [schemes, showTpOverlay, tpOpacity]
  );
  const dpPolygons = useMemo(
    () => (showDpOverlay ? overlaysToPolygons(dpOverlays, overlayOpacity) : []),
    [dpOverlays, showDpOverlay, overlayOpacity]
  );
  const fpPolygons = useMemo(
    () => (showFpOverlay ? overlaysToPolygons(fpOverlays, overlayOpacity) : []),
    [fpOverlays, showFpOverlay, overlayOpacity]
  );
  const villagePolygons = useMemo(
    () =>
      showVillageOverlay ? villagesToPolygons(villages, overlayOpacity) : [],
    [villages, showVillageOverlay, overlayOpacity]
  );

  const allPolygons: MapPolygon[] = useMemo(
    () => [...dpPolygons, ...fpPolygons, ...villagePolygons, ...tpPolygons],
    [dpPolygons, fpPolygons, villagePolygons, tpPolygons]
  );

  const initialRegion = focusCenter
    ? {
        latitude: focusCenter.latitude,
        longitude: focusCenter.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }
    : {
        latitude: SURAT_MAP_CENTER.latitude,
        longitude: SURAT_MAP_CENTER.longitude,
        latitudeDelta: SURAT_MAP_CENTER.latitudeDelta,
        longitudeDelta: SURAT_MAP_CENTER.longitudeDelta,
      };

  useEffect(() => {
    if (!focusCenter || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: focusCenter.latitude,
        longitude: focusCenter.longitude,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      },
      400
    );
  }, [focusCenter?.latitude, focusCenter?.longitude]);

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === "android" ? undefined : PROVIDER_DEFAULT}
        mapType={mapType}
        initialRegion={initialRegion}
        showsUserLocation
        showsCompass
      >
        {allPolygons.map((poly) => (
          <Polygon
            key={poly.id}
            coordinates={poly.coordinates}
            fillColor={poly.fillColor}
            strokeColor={poly.strokeColor}
            strokeWidth={selectedSchemeId === poly.id ? 3 : 1.5}
            tappable={!!onSchemePress}
            onPress={() => onSchemePress?.(poly.id)}
          />
        ))}
        {showTpMarkers &&
          schemes.map((scheme) => (
            <Marker
              key={`tp-${scheme.id}`}
              coordinate={{
                latitude: scheme.center_lat,
                longitude: scheme.center_lng,
              }}
              title={scheme.scheme_number}
              description={scheme.name}
              pinColor={selectedSchemeId === scheme.id ? "#1b6b4a" : "#5c6b62"}
              onPress={() => onSchemePress?.(scheme.id)}
            />
          ))}
        {showListings &&
          listings.map((listing) => (
            <Marker
              key={`listing-${listing.id}`}
              coordinate={{
                latitude: listing.latitude,
                longitude: listing.longitude,
              }}
              title={listing.title}
              description={
                listing.locality_name
                  ? `${listing.intent} · ${listing.locality_name}`
                  : listing.intent
              }
              pinColor={intentPinColor(listing.intent)}
              onPress={() => onListingPress?.(listing.id)}
            />
          ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  map: { width: "100%", height: "100%" },
});
