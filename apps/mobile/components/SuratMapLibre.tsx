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
import { MAP_STYLE_OSM, MAP_STYLE_SATELLITE } from "@/lib/map-styles";
import {
  tpSchemesToPolygons,
  overlaysToPolygons,
  villagesToPolygons,
  polygonsToFeatureCollection,
  listingsToFeatureCollection,
  noticesToFeatureCollection,
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
  notices = [],
  showTpOverlay,
  showDpOverlay = false,
  showFpOverlay = false,
  showVillageOverlay = false,
  showListings = false,
  showNotices = false,
  showTpMarkers = true,
  tpOpacity,
  overlayOpacity = 0.35,
  mapType,
  selectedSchemeId,
  focusCenter,
  onSchemePress,
  onListingPress,
  onNoticePress,
  onEngineFailed,
}: SuratMapProps & { onEngineFailed?: () => void }) {
  const cameraRef = useRef<CameraRef>(null);
  const [styleFailed, setStyleFailed] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);

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
  const noticesGeo = useMemo(
    () => (showNotices ? noticesToFeatureCollection(notices) : { type: "FeatureCollection" as const, features: [] }),
    [notices, showNotices]
  );

  const wantSatellite = mapType === "hybrid" || mapType === "satellite";
  const mapStyle = styleFailed || loadTimedOut
    ? MAP_STYLE_OSM
    : wantSatellite
      ? MAP_STYLE_SATELLITE
      : MAP_STYLE_OSM;

  useEffect(() => {
    const t = setTimeout(() => {
      if (!mapReady) {
        setLoadTimedOut(true);
        setMapReady(true);
        onEngineFailed?.();
      }
    }, 8000);
    return () => clearTimeout(t);
  }, [mapReady, onEngineFailed]);

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
      {(styleFailed || loadTimedOut) && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            {loadTimedOut
              ? "Map tiles slow or blocked — switched to standard map. Ensure phone has internet."
              : "Satellite unavailable — showing OpenStreetMap."}
          </Text>
        </View>
      )}
      <Map
        style={styles.map}
        mapStyle={mapStyle}
        onDidFinishLoadingMap={() => {
          setMapReady(true);
          setLoadTimedOut(false);
        }}
        onDidFailLoadingMap={() => {
          setStyleFailed(true);
          setMapReady(true);
          onEngineFailed?.();
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
        {showNotices && noticesGeo.features.length > 0 && (
          <GeoJSONSource
            id="notices"
            data={noticesGeo}
            onPress={(e) => {
              const id = e.nativeEvent.features[0]?.properties?.id;
              if (typeof id === "string") onNoticePress?.(id);
            }}
          >
            <Layer
              type="heatmap"
              id="notices-heatmap"
              paint={{
                "heatmap-weight": 1,
                "heatmap-intensity": 0.5,
                "heatmap-radius": 28,
                "heatmap-opacity": 0.65,
                "heatmap-color": [
                  "interpolate",
                  ["linear"],
                  ["heatmap-density"],
                  0,
                  "rgba(0,0,0,0)",
                  0.4,
                  "rgba(27,107,74,0.4)",
                  1,
                  "rgba(21,101,192,0.7)",
                ],
              }}
            />
            <Layer
              type="circle"
              id="notices-dots"
              paint={{
                "circle-radius": 7,
                "circle-color": ["get", "color"],
                "circle-stroke-width": 1.5,
                "circle-stroke-color": "#ffffff",
              }}
            />
          </GeoJSONSource>
        )}
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
