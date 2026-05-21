import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Map,
  Camera,
  GeoJSONSource,
  Layer,
  Marker,
  UserLocation,
  type CameraRef,
} from "@maplibre/maplibre-react-native";
import type { TpSchemeMap } from "@realpoint/shared";
import { SURAT_MAP_CENTER } from "@realpoint/shared";
import { MAP_STYLE_SATELLITE, MAP_STYLE_STREETS } from "@/lib/map-styles";
import {
  tpSchemesToPolygons,
  overlaysToPolygons,
  villagesToPolygons,
  polygonsToFeatureCollection,
  listingsToFeatureCollection,
} from "@/lib/maps";
import type { SuratMapProps } from "./SuratMapLegacy";

function OverlayLayers({
  sourceId,
  data,
  selectedSchemeId,
  onSchemePress,
}: {
  sourceId: string;
  data: GeoJSON.FeatureCollection;
  selectedSchemeId?: string | null;
  onSchemePress?: (id: string) => void;
}) {
  if (!data.features.length) return null;
  return (
    <GeoJSONSource
      id={sourceId}
      data={data}
      onPress={(e) => {
        const id = e.nativeEvent.features[0]?.properties?.id;
        if (typeof id === "string") onSchemePress?.(id);
      }}
    >
      <Layer
        type="fill"
        id={`${sourceId}-fill`}
        paint={{
          "fill-color": ["get", "fillColor"],
          "fill-opacity": ["get", "fillOpacity"],
        }}
      />
      <Layer
        type="line"
        id={`${sourceId}-line`}
        paint={{
          "line-color": ["get", "strokeColor"],
          "line-width": [
            "case",
            ["==", ["get", "id"], selectedSchemeId ?? ""],
            3,
            1.5,
          ],
        }}
      />
    </GeoJSONSource>
  );
}

export function SuratMapLibre({
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
  const cameraRef = useRef<CameraRef>(null);
  const [styleFailed, setStyleFailed] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const tpGeo = useMemo(
    () =>
      polygonsToFeatureCollection(
        showTpOverlay ? tpSchemesToPolygons(schemes, tpOpacity) : []
      ),
    [schemes, showTpOverlay, tpOpacity]
  );
  const dpGeo = useMemo(
    () =>
      polygonsToFeatureCollection(
        showDpOverlay ? overlaysToPolygons(dpOverlays, overlayOpacity) : []
      ),
    [dpOverlays, showDpOverlay, overlayOpacity]
  );
  const fpGeo = useMemo(
    () =>
      polygonsToFeatureCollection(
        showFpOverlay ? overlaysToPolygons(fpOverlays, overlayOpacity) : []
      ),
    [fpOverlays, showFpOverlay, overlayOpacity]
  );
  const villageGeo = useMemo(
    () =>
      polygonsToFeatureCollection(
        showVillageOverlay
          ? villagesToPolygons(villages, overlayOpacity)
          : []
      ),
    [villages, showVillageOverlay, overlayOpacity]
  );
  const listingsGeo = useMemo(
    () => (showListings ? listingsToFeatureCollection(listings) : { type: "FeatureCollection" as const, features: [] }),
    [listings, showListings]
  );

  const wantSatellite = mapType === "hybrid" || mapType === "satellite";
  const mapStyle = styleFailed
    ? MAP_STYLE_STREETS
    : wantSatellite
      ? MAP_STYLE_SATELLITE
      : MAP_STYLE_STREETS;

  const initialCenter: [number, number] = focusCenter
    ? [focusCenter.longitude, focusCenter.latitude]
    : [SURAT_MAP_CENTER.longitude, SURAT_MAP_CENTER.latitude];

  useEffect(() => {
    if (!focusCenter) return;
    cameraRef.current?.easeTo({
      center: [focusCenter.longitude, focusCenter.latitude],
      zoom: 13,
      duration: 400,
    });
  }, [focusCenter?.latitude, focusCenter?.longitude]);

  return (
    <View style={styles.wrap}>
      {!mapReady && (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading map…</Text>
        </View>
      )}
      {styleFailed && wantSatellite && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            Satellite tiles unavailable — showing street map.
          </Text>
        </View>
      )}
      <Map
        style={styles.map}
        mapStyle={mapStyle}
        onDidFinishLoadingMap={() => setMapReady(true)}
        onDidFailLoadingMap={() => {
          setStyleFailed(true);
          setMapReady(true);
        }}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: initialCenter,
            zoom: 10,
          }}
        />
        <UserLocation accuracy />
        <OverlayLayers
          sourceId="tp-overlays"
          data={tpGeo}
          selectedSchemeId={selectedSchemeId}
          onSchemePress={onSchemePress}
        />
        <OverlayLayers
          sourceId="dp-overlays"
          data={dpGeo}
          onSchemePress={onSchemePress}
        />
        <OverlayLayers
          sourceId="fp-overlays"
          data={fpGeo}
          onSchemePress={onSchemePress}
        />
        <OverlayLayers
          sourceId="village-overlays"
          data={villageGeo}
          onSchemePress={onSchemePress}
        />
        {showListings && listingsGeo.features.length > 0 && (
          <GeoJSONSource
            id="listings"
            data={listingsGeo}
            onPress={(e) => {
              const id = e.nativeEvent.features[0]?.properties?.id;
              if (typeof id === "string") onListingPress?.(id);
            }}
          >
            <Layer
              type="circle"
              id="listings-circles"
              paint={{
                "circle-radius": 9,
                "circle-color": ["get", "color"],
                "circle-stroke-width": 2,
                "circle-stroke-color": "#ffffff",
              }}
            />
          </GeoJSONSource>
        )}
        {showTpMarkers &&
          schemes.map((scheme: TpSchemeMap) => (
            <Marker
              key={`tp-${scheme.id}`}
              id={`tp-${scheme.id}`}
              lngLat={[scheme.center_lng, scheme.center_lat]}
              onPress={() => onSchemePress?.(scheme.id)}
            >
              <View
                style={[
                  styles.tpDot,
                  selectedSchemeId === scheme.id && styles.tpDotSelected,
                ]}
              />
            </Marker>
          ))}
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, overflow: "hidden" },
  map: { ...StyleSheet.absoluteFillObject },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e8ece9",
    zIndex: 1,
  },
  loadingText: { color: "#5c6b62" },
  hint: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: "rgba(255,248,225,0.95)",
    padding: 8,
    borderRadius: 8,
  },
  hintText: { fontSize: 11, color: "#7a5c00" },
  tpDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#5c6b62",
    borderWidth: 2,
    borderColor: "#fff",
  },
  tpDotSelected: {
    backgroundColor: "#1b6b4a",
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});
