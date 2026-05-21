import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  LISTING_INTENTS,
  MAP_DISCLAIMER,
  MAP_LAYER_LABELS,
  PROPERTY_CLASS_LABELS,
  type MapOverlay,
} from "@realpoint/shared";
import { supabase } from "@/lib/supabase";
import { SuratMap } from "@/components/SuratMap";
import { useMapLayers } from "@/hooks/useMapLayers";
import { colors } from "@/constants/theme";

export default function MapTabScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    scheme?: string;
    listing?: string;
    mode?: string;
    showFp?: string;
  }>();
  const [listingIntent, setListingIntent] = useState<string | null>(null);
  const { schemes, dpOverlays, fpOverlays, villages, listings, loading, error } =
    useMapLayers(listingIntent);
  const [schemeFpOverlays, setSchemeFpOverlays] = useState<MapOverlay[]>([]);

  /** Planning = TP/DP/village (Town Plan style). Listings = marketplace pins only. */
  const [mapMode, setMapMode] = useState<"planning" | "listings">(
    params.mode === "listings" ? "listings" : "planning"
  );
  const [satellite, setSatellite] = useState(false);
  const [showTp, setShowTp] = useState(true);
  const [showDp, setShowDp] = useState(false);
  const [showVillages, setShowVillages] = useState(false);
  const [showFp, setShowFp] = useState(params.showFp === "1");
  const showListings = mapMode === "listings";
  const showPlanningLayers = mapMode === "planning";
  const [tpOpacity, setTpOpacity] = useState(0.45);
  const [overlayOpacity, setOverlayOpacity] = useState(0.35);
  const [panelExpanded, setPanelExpanded] = useState(true);

  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(
    typeof params.scheme === "string" ? params.scheme : null
  );
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    typeof params.listing === "string" ? params.listing : null
  );

  useEffect(() => {
    if (typeof params.scheme === "string") setSelectedSchemeId(params.scheme);
  }, [params.scheme]);

  useEffect(() => {
    if (params.mode === "planning") setMapMode("planning");
    if (params.mode === "listings") setMapMode("listings");
  }, [params.mode]);

  useEffect(() => {
    if (params.showFp === "1") {
      setShowFp(true);
      setMapMode("planning");
    }
  }, [params.showFp]);

  useEffect(() => {
    if (!showFp || !selectedSchemeId) {
      setSchemeFpOverlays([]);
      return;
    }
    supabase
      .rpc("get_fp_overlays_for_scheme", { p_scheme_id: selectedSchemeId })
      .then(({ data }) => setSchemeFpOverlays((data as MapOverlay[]) ?? []));
  }, [showFp, selectedSchemeId]);

  const fpForMap =
    showFp && selectedSchemeId ? schemeFpOverlays : [];

  useEffect(() => {
    if (typeof params.listing === "string") {
      setSelectedListingId(params.listing);
      setMapMode("listings");
    }
  }, [params.listing]);

  const selectedScheme = useMemo(
    () => schemes.find((s) => s.id === selectedSchemeId) ?? null,
    [schemes, selectedSchemeId]
  );

  const selectedListing = useMemo(
    () => listings.find((l) => l.id === selectedListingId) ?? null,
    [listings, selectedListingId]
  );

  const focusCenter = useMemo(() => {
    if (selectedListing) {
      return {
        latitude: selectedListing.latitude,
        longitude: selectedListing.longitude,
      };
    }
    if (selectedScheme) {
      return {
        latitude: selectedScheme.center_lat,
        longitude: selectedScheme.center_lng,
      };
    }
    return null;
  }, [selectedListing, selectedScheme]);

  return (
    <View style={styles.container}>
      <SuratMap
        schemes={schemes}
        dpOverlays={dpOverlays}
        fpOverlays={fpForMap}
        villages={villages}
        listings={listings}
        showTpOverlay={showPlanningLayers && showTp}
        showDpOverlay={showPlanningLayers && showDp}
        showFpOverlay={showPlanningLayers && showFp}
        showVillageOverlay={showPlanningLayers && showVillages}
        showListings={showListings}
        showTpMarkers={showPlanningLayers && !showTp}
        tpOpacity={tpOpacity}
        overlayOpacity={overlayOpacity}
        mapType={satellite ? "hybrid" : "standard"}
        selectedSchemeId={selectedSchemeId}
        selectedListingId={selectedListingId}
        focusCenter={focusCenter}
        onSchemePress={(id) => {
          setSelectedSchemeId(id);
          setSelectedListingId(null);
        }}
        onListingPress={(id) => {
          setSelectedListingId(id);
          setSelectedSchemeId(null);
        }}
      />
      <View style={[styles.panel, !panelExpanded && styles.panelCollapsed]}>
        <Pressable
          style={styles.panelHeader}
          onPress={() => setPanelExpanded((v) => !v)}
        >
          <Text style={styles.panelTitle}>Surat map</Text>
          <View style={styles.panelHeaderRight}>
            <Pressable onPress={() => router.push("/maps/directory")}>
              <Text style={styles.link}>TP directory</Text>
            </Pressable>
            <Text style={styles.chevron}>{panelExpanded ? "▼" : "▲"}</Text>
          </View>
        </Pressable>
        {panelExpanded && (
          <ScrollView style={styles.panelScroll} nestedScrollEnabled>
            {loading ? (
              <Text style={styles.muted}>Loading map data…</Text>
            ) : error ? (
              <Text style={styles.error}>{error}</Text>
            ) : null}
            <Text style={styles.section}>Map mode</Text>
            <View style={styles.modeRow}>
              <Pressable
                style={[
                  styles.modeChip,
                  mapMode === "planning" && styles.modeChipOn,
                ]}
                onPress={() => setMapMode("planning")}
              >
                <Text
                  style={
                    mapMode === "planning"
                      ? styles.modeChipOnText
                      : styles.muted
                  }
                >
                  Planning
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modeChip,
                  mapMode === "listings" && styles.modeChipOn,
                ]}
                onPress={() => setMapMode("listings")}
              >
                <Text
                  style={
                    mapMode === "listings"
                      ? styles.modeChipOnText
                      : styles.muted
                  }
                >
                  Listings
                </Text>
              </Pressable>
            </View>
            <Text style={styles.sectionHint}>
              {mapMode === "planning"
                ? "TP / DP / village layers (like Town Plan Map). FP sheets open from a TP scheme."
                : "Property pins only — browse on the Properties tab for full listings."}
            </Text>
            <Text style={styles.section}>Basemap</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Satellite</Text>
              <Switch value={satellite} onValueChange={setSatellite} />
            </View>
            {mapMode === "planning" && (
              <>
                <Text style={styles.section}>Planning layers</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>{MAP_LAYER_LABELS.tp}</Text>
                  <Switch value={showTp} onValueChange={setShowTp} />
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>{MAP_LAYER_LABELS.dp}</Text>
                  <Switch value={showDp} onValueChange={setShowDp} />
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>{MAP_LAYER_LABELS.village}</Text>
                  <Switch
                    value={showVillages}
                    onValueChange={setShowVillages}
                  />
                </View>
                <Text style={styles.label}>TP opacity</Text>
                <View style={styles.opacityRow}>
                  {[0.25, 0.45, 0.65, 0.85].map((v) => (
                    <Pressable
                      key={`tp-${v}`}
                      style={[
                        styles.opacityChip,
                        tpOpacity === v && styles.opacityChipOn,
                      ]}
                      onPress={() => setTpOpacity(v)}
                    >
                      <Text
                        style={
                          tpOpacity === v
                            ? styles.opacityChipOnText
                            : styles.muted
                        }
                      >
                        {Math.round(v * 100)}%
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {showFp && (
                  <Text style={styles.meta}>
                    Showing FP blocks for this scheme (from TP detail).
                  </Text>
                )}
                {selectedSchemeId ? (
                  <View style={styles.row}>
                    <Text style={styles.label}>Final plot (FP)</Text>
                    <Switch value={showFp} onValueChange={setShowFp} />
                  </View>
                ) : (
                  <Text style={styles.meta}>
                    Select a TP scheme to view FP blocks (TP directory).
                  </Text>
                )}
                {(showDp || showFp || showVillages) && (
                  <>
                    <Text style={styles.label}>DP / village opacity</Text>
                    <View style={styles.opacityRow}>
                      {[0.2, 0.35, 0.5].map((v) => (
                        <Pressable
                          key={`ov-${v}`}
                          style={[
                            styles.opacityChip,
                            overlayOpacity === v && styles.opacityChipOn,
                          ]}
                          onPress={() => setOverlayOpacity(v)}
                        >
                          <Text
                            style={
                              overlayOpacity === v
                                ? styles.opacityChipOnText
                                : styles.muted
                            }
                          >
                            {Math.round(v * 100)}%
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}
              </>
            )}
            {mapMode === "listings" && (
              <>
                <Text style={styles.section}>Listing filters</Text>
                <View style={styles.opacityRow}>
                  <Pressable
                    style={[
                      styles.opacityChip,
                      listingIntent === null && styles.opacityChipOn,
                    ]}
                    onPress={() => setListingIntent(null)}
                  >
                    <Text
                      style={
                        listingIntent === null
                          ? styles.opacityChipOnText
                          : styles.muted
                      }
                    >
                      All
                    </Text>
                  </Pressable>
                  {LISTING_INTENTS.map((intent) => (
                    <Pressable
                      key={intent}
                      style={[
                        styles.opacityChip,
                        listingIntent === intent && styles.opacityChipOn,
                      ]}
                      onPress={() => setListingIntent(intent)}
                    >
                      <Text
                        style={
                          listingIntent === intent
                            ? styles.opacityChipOnText
                            : styles.muted
                        }
                      >
                        {intent}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
            {selectedScheme ? (
              <Pressable
                style={styles.card}
                onPress={() => router.push(`/maps/${selectedScheme.id}`)}
              >
                <Text style={styles.cardTitle}>
                  {selectedScheme.scheme_number} — {selectedScheme.name}
                </Text>
                <Text style={styles.muted}>TP scheme · tap for details</Text>
              </Pressable>
            ) : null}
            {selectedListing ? (
              <Pressable
                style={styles.card}
                onPress={() => router.push(`/listings/${selectedListing.id}`)}
              >
                <Text style={styles.cardTitle}>{selectedListing.title}</Text>
                <Text style={styles.muted}>
                  {selectedListing.intent} ·{" "}
                  {PROPERTY_CLASS_LABELS[
                    selectedListing.property_class as keyof typeof PROPERTY_CLASS_LABELS
                  ] ?? selectedListing.property_class}
                  {selectedListing.price
                    ? ` · ₹${Number(selectedListing.price).toLocaleString("en-IN")}`
                    : ""}
                </Text>
              </Pressable>
            ) : null}
            {!selectedScheme && !selectedListing ? (
              <Text style={styles.muted}>
                {mapMode === "planning"
                  ? "Tap a TP zone or use TP directory."
                  : "Tap a property pin."}
              </Text>
            ) : null}
            <Text style={styles.disclaimer}>{MAP_DISCLAIMER}</Text>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 14,
    paddingBottom: 10,
    maxHeight: 340,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  panelCollapsed: { maxHeight: 52 },
  panelScroll: { maxHeight: 280 },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  panelHeaderRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  panelTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  chevron: { color: colors.muted, fontSize: 12 },
  link: { color: colors.primary, fontWeight: "600" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  section: {
    fontWeight: "700",
    color: colors.primary,
    fontSize: 12,
    marginTop: 10,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionHint: { color: colors.muted, fontSize: 12, marginBottom: 8, lineHeight: 18 },
  modeRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  modeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  modeChipOn: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  modeChipOnText: { color: colors.primary, fontWeight: "700" },
  label: { fontWeight: "600", color: colors.text, fontSize: 13 },
  meta: { color: colors.muted, fontSize: 12, marginBottom: 6 },
  muted: { color: colors.muted, fontSize: 13 },
  error: { color: colors.danger, marginBottom: 6 },
  opacityRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  opacityChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  opacityChipOn: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  opacityChipOnText: { color: colors.primary, fontWeight: "600" },
  card: {
    backgroundColor: colors.primaryLight,
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  cardTitle: { fontWeight: "700", color: colors.primary },
  disclaimer: { fontSize: 11, color: colors.muted, marginTop: 4, marginBottom: 8 },
});
