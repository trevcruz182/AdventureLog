import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRef, useState, useEffect, useMemo } from "react";
import { router } from "expo-router";

import { 
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import MapView, {MapType, Region} from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import { AdventureMapMarker } from "@/components/map/AdventureMapMarker";
import { MapAdventurePreview } from "@/components/map/MapAdventurePreview";
import { useNetworkStatus } from "@/features/network/NetworkProvider";
import { OfflineDataState } from "@/components/network/OfflineDataState";
import { useAdventures } from "@/features/adventures/useAdventures";
import { getMappedAdventures, MappedAdventure } from "@/features/adventures/adventureCoordinates";
import { ApiError } from "@/lib/api/ApiError";
import { AppColors, spacing, useAppTheme } from "@/theme";
import type { AdventureCategory, AdventureStatus } from "@/types/adventure";

type MapFilter = "all" | AdventureCategory;

type MapStatusFilter = "all" | AdventureStatus;

const DEFAULT_REGION: Region = {
    latitude: 41.37,
    longitude: -73.86,
    latitudeDelta: 0.75,
    longitudeDelta: 0.75
};

const mapFilters: Array<{
    label: string;
    value: MapFilter;
    icon: React.ComponentProps<typeof Ionicons>["name"];
}> = [
    {
        label: "All",
        value: "all",
        icon: "apps-outline",
    },
    {
        label: "Hiking",
        value: "hiking",
        icon: "trail-sign-outline",
    },
    {
        label: "Sports",
        value: "sports",
        icon: "trophy-outline",
    },
    {
        label: "Travel",
        value: "travel",
        icon: "airplane-outline",
    },
    {
        label: "Food",
        value: "food",
        icon: "restaurant-outline",
    },
    {
        label: "Outdoors",
        value: "outdoors",
        icon: "leaf-outline",
    },
]

const mapStatusFilters: Array<{
    label: string;
    value: MapStatusFilter;
    icon: React.ComponentProps<typeof Ionicons>["name"];
}> = [
    {
        label: "Completed",
        value: "completed",
        icon: "checkmark-circle-outline",
    },
    {
        label: "Planned",
        value: "wishlist",
        icon: "calendar-outline",
    },
    {
        label: "All",
        value: "all",
        icon: "apps-outline",
    },
]

export default function MapScreen() {
    const {colors, isDark} = useAppTheme();
    const styles = createStyles(colors);

    const {isOnline} = useNetworkStatus();

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching,
    } = useAdventures({limit: 100});

    const mappedAdventures = useMemo(() => getMappedAdventures(data?.items ?? []), [data]);

    const mapRef = useRef<MapView | null>(null);

    const [selectedAdventureId, setSelectedAdventureId] = useState<string | null>(null);

    const [selectedFilter, setSelectedFilter] = useState<MapFilter>("all");

    const [selectedStatus, setSelectedStatus] = useState<MapStatusFilter>("completed");

    const [mapType, setMapType] = useState<MapType>("standard");

    const [isLocating, setIsLocating] = useState(false);

    const visibleAdventures = useMemo(() => mappedAdventures.filter((adventure) => {
        const matchesCategory = selectedFilter === "all" || adventure.category === selectedFilter;
        
        const matchesStatus = selectedStatus === "all" || adventure.status === selectedStatus;

        return matchesCategory && matchesStatus;
    }), [mappedAdventures, selectedFilter, selectedStatus]);

    const selectedAdventure = mappedAdventures.find((adventure) => adventure.id === selectedAdventureId) ?? null;

    useEffect(() => {
        if(visibleAdventures.length === 0) {
            return;
        }

        const timeout = setTimeout(() => {
            mapRef.current?.fitToCoordinates(visibleAdventures.map((adventure) => ({
                latitude: adventure.latitudeNumber,
                longitude: adventure.longitudeNumber
            })),
            {
                edgePadding: {
                    top: 180,
                    right: 60,
                    bottom: 220,
                    left: 60
                },
                animated: true,
            }
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [visibleAdventures]);

    useEffect(() => {
        if(!selectedAdventureId) {
            return;
        }

        const isStillVisible = visibleAdventures.some((adventure) => adventure.id === selectedAdventureId);

        if(!isStillVisible) {
            setSelectedAdventureId(null);
        }
    }, [selectedAdventureId, visibleAdventures]);

    function handleSelectAdventure(adventure: MappedAdventure) {
        setSelectedAdventureId(adventure.id);

        mapRef.current?.animateToRegion({
            latitude: adventure.latitudeNumber - 0.015,
            longitude: adventure.longitudeNumber,
            latitudeDelta: 0.12,
            longitudeDelta: 0.12,
        }, 400);
    }

    async function handleLocateUser() {
        try {
            setIsLocating(true);

            const permission = await Location.requestForegroundPermissionsAsync();

            if(permission.status !== "granted") {
                Alert.alert("Location permission needed", "AdventureLog needs location access to center the map on your current position.");
                return;
            }

            const location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Balanced});

            mapRef.current?.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
            }, 500);
        }
        catch {
            Alert.alert("Unable to find your location", "Check that location services are enabled and try again.");
        }
        finally {
            setIsLocating(false);
        }
    }

    function toggleMapType() {
        setMapType((currentType) => currentType === "standard" ? "hybrid" : "standard");
    }

    if(!isOnline && data === undefined) {
        return(
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <OfflineDataState title="Map isn't cached yet" description="Reconnect and open Map once to save your adventure locations on this device." />
            </SafeAreaView>
        );
    }

    return(
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <View style={styles.container}>
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFill}
                    initialRegion={DEFAULT_REGION}
                    mapType={mapType}
                    showsCompass={false}
                    showsUserLocation
                    showsMyLocationButton={false}
                    userInterfaceStyle={isDark ? "dark" : "light"}
                >
                    {visibleAdventures.map((adventure) => (
                        <AdventureMapMarker 
                            key={adventure.id}
                            adventure={adventure}
                            isSelected={selectedAdventureId === adventure.id}
                            onPress={() => handleSelectAdventure(adventure)}
                        />
                    ))}
                </MapView>

                <View style={styles.topContent}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.eyebrow}>
                                Your world
                            </Text>

                            <Text style={styles.title}>
                                Adventure Map
                            </Text>
                        </View>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Switch map style"
                            onPress={toggleMapType}
                            style={({pressed}) => [styles.roundButton, pressed && styles.pressed]}
                        >
                            <Ionicons name={mapType === "standard" ? "layers-outline" : "map-outline"} size={21} color={colors.textPrimary} />
                        </Pressable>
                    </View>

                    <View style={styles.statusFilters}>
                        {mapStatusFilters.map((filter) => {
                            const isSelected = selectedStatus === filter.value;

                            return(
                                <Pressable
                                    key={filter.value}
                                    accessibilityRole="button"
                                    accessibilityState={{selected: isSelected}}
                                    onPress={() => {
                                        setSelectedStatus(filter.value);

                                        setSelectedAdventureId(null);
                                    }}
                                    style={({pressed}) => [styles.statusFilter, isSelected && styles.statusFilterSelected, pressed && styles.pressed]}
                                >
                                    <Ionicons name={filter.icon} size={15} color={isSelected ? colors.background : colors.textPrimary} />

                                    <Text style={[styles.statusFilterText, isSelected && styles.statusFilterTextSelected]}>
                                        {filter.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filters}
                        style={styles.filterScroll}
                    >
                        {mapFilters.map((filter) => {
                            const isSelected = selectedFilter === filter.value;
                            
                            return(
                                <Pressable
                                    key={filter.value}
                                    onPress={() => {
                                        setSelectedFilter(filter.value);
                                        setSelectedAdventureId(null);
                                    }}
                                    style={({pressed}) => [styles.filterChip, isSelected && styles.filterChipSelected, pressed && styles.pressed]}
                                >
                                    <Ionicons name={filter.icon} size={15} color={isSelected ? colors.background : colors.textSecondary} />

                                    <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
                                        {filter.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>

                {isLoading ? (
                    <View style={styles.mapStatusCard}>
                        <ActivityIndicator size="small" color={colors.forest} />
                        <Text style={styles.mapStatusText}>Loading your map…</Text>
                    </View>
                ) : null}

                {isError ? (
                    <View style={styles.mapErrorCard}>
                        <Ionicons name="cloud-offline-outline" size={20} color={colors.danger} />

                        <View style={styles.mapErrorContent}>
                            <Text style={styles.mapErrorTitle}>Adventures unavailable</Text>
                            <Text style={styles.mapErrorDescription}>
                                {error instanceof ApiError
                                    ? error.message
                                    : "AdventureLog could not load your saved locations."}
                            </Text>
                        </View>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Retry loading adventures"
                            disabled={isRefetching}
                            onPress={() => void refetch()}
                            style={styles.mapRetryButton}
                        >
                            {isRefetching ? (
                                <ActivityIndicator size="small" color={colors.forest} />
                            ) : (
                                <Ionicons name="refresh" size={19} color={colors.forest} />
                            )}
                        </Pressable>
                    </View>
                ) : null}

                {!isLoading && !isError && data?.items.length === 0 ? (
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => router.navigate("/(tabs)/create")}
                        style={styles.noLocationsCard}
                    >
                        <Ionicons name="map-outline" size={24} color={colors.clay} />
                        <View style={styles.noLocationsContent}>
                            <Text style={styles.noLocationsTitle}>Your map is waiting</Text>
                            <Text style={styles.noLocationsDescription}>
                                Log or plan your first adventure to place it on the map.
                            </Text>
                        </View>
                        <Ionicons name="arrow-forward" size={20} color={colors.forest} />
                    </Pressable>
                ) : null}

                {!isLoading && !isError && data && data.items.length > 0 && mappedAdventures.length === 0 ? (
                    <View style={styles.noLocationsCard}>
                        <Ionicons name="location-outline" size={24} color={colors.clay} />
                        <View style={styles.noLocationsContent}>
                            <Text style={styles.noLocationsTitle}>No mapped adventures yet</Text>
                            <Text style={styles.noLocationsDescription}>
                                Adventures need coordinates before they can appear on your map.
                            </Text>
                        </View>
                    </View>
                ) : null}

                {!isLoading && !isError && mappedAdventures.length > 0 && visibleAdventures.length === 0 ? (
                    <View style={styles.noLocationsCard}>
                        <Ionicons name="filter-outline" size={24} color={colors.clay} />

                        <View style={styles.noLocationsContent}>
                            <Text style={styles.noLocationsTitle}>
                                No matching places
                            </Text>

                            <Text style={styles.noLocationsDescription}>
                                Try another status or category filter.
                            </Text>
                        </View>
                    </View>
                ): null}

                <View
                    style={[styles.mapControls, selectedAdventure && styles.mapControlsWithPreview]}
                >
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Center map on my location"
                        onPress={() => void handleLocateUser()}
                        disabled={isLocating}
                        style={({pressed}) => [styles.roundButton, pressed && styles.pressed]}
                    >
                        {isLocating ? (
                            <ActivityIndicator size="small" color={colors.forest} />
                        ): (
                            <Ionicons name="locate" size={21} color={colors.forest} />
                        )}
                    </Pressable>

                    <View style={styles.countBadge}>
                        <Ionicons name="location" size={15} color={colors.clay} />

                        <Text  style={styles.countText}>
                            {visibleAdventures.length}{" "}
                            {visibleAdventures.length === 1 ? "place" : "places"}
                        </Text>
                    </View>
                </View>

                {selectedAdventure ? (
                    <View pointerEvents="box-none" style={styles.previewOverlay}>
                        <MapAdventurePreview 
                            adventure={selectedAdventure} 
                            onClose={() => setSelectedAdventureId(null)} 
                            onPress={() => router.push({
                                pathname: "/adventures/[adventureId]",
                                params: {
                                    adventureId: selectedAdventure.id
                                }
                            })}
                        />
                    </View>
                ): null}
            </View>
        </SafeAreaView>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.background,
        },
        container: {
            flex: 1,
        },
        topContent: {
            position: "absolute",
            top: spacing.md,
            right: 0,
            left: 0,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginHorizontal: spacing.lg,
            padding: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 24,
            shadowColor: "#000000",
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.14,
            shadowRadius: 10,
            elevation: 6,
        },
        eyebrow: {
            color: colors.clay,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 1.1,
            textTransform: "uppercase",
        },
        title: {
            marginTop: 3,
            color: colors.textPrimary,
            fontSize: 24,
            fontWeight: "800",
        },
        roundButton: {
            width: 46,
            height: 46,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 23,
            shadowColor: "#000000",
            shadowOffset: {
                width: 0,
                height: 3,
            },
            shadowOpacity: 0.13,
            shadowRadius: 7,
            elevation: 5,
        },
        filterScroll: {
            marginTop: spacing.md,
        },
        filters: {
            gap: spacing.sm,
            paddingHorizontal: spacing.lg,
        },
        filterChip: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 999,
            shadowColor: "#000000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 3,
        },
        filterChipSelected: {
            backgroundColor: colors.forest,
            borderColor: colors.forest,
        },
        filterText: {
            color: colors.textSecondary,
            fontSize: 13,
            fontWeight: "700",
        },
        filterTextSelected: {
            color: colors.background,
        },
        mapControls: {
            position: "absolute",
            right: spacing.lg,
            bottom: spacing.lg,
            left: spacing.lg,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        mapControlsWithPreview: {
            bottom: 235,
        },
        previewOverlay: {
            position: "absolute",
            right: spacing.lg,
            bottom: spacing.lg,
            left: spacing.lg,
            zIndex: 20,
            elevation: 20,
        },
        countBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 11,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 999,
            shadowColor: "#000000",
            shadowOffset: {
                width: 0,
                height: 3,
            },
            shadowOpacity: 0.13,
            shadowRadius: 7,
            elevation: 5,
        },
        countText: {
            color: colors.textPrimary,
            fontSize: 13,
            fontWeight: "800",
        },
        mapStatusCard: {
            position: "absolute",
            top: 166,
            alignSelf: "center",
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 999,
        },
        mapStatusText: {
            color: colors.textPrimary,
            fontSize: 12,
            fontWeight: "800",
        },
        statusFilters: {
            flexDirection: "row",
            gap: spacing.sm,
            marginHorizontal: spacing.lg,
            marginTop: spacing.md,
        },
        statusFilter: {
            flex: 1,
            minHeight: 42,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.xs,
            paddingHorizontal: spacing.sm,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            shadowColor: "#000000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2
        },
        statusFilterSelected: {
            backgroundColor: colors.forest,
            borderColor: colors.forest
        },
        statusFilterText: {
            color: colors.textSecondary,
            fontSize: 11,
            fontWeight: "800"
        },
        statusFilterTextSelected: {
            color: colors.background
        },
        mapErrorCard: {
            position: "absolute",
            top: 166,
            right: spacing.lg,
            left: spacing.lg,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            padding: spacing.md,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.danger,
            borderRadius: 18,
        },
        mapErrorContent: {
            flex: 1,
        },
        mapErrorTitle: {
            color: colors.textPrimary,
            fontSize: 13,
            fontWeight: "800",
        },
        mapErrorDescription: {
            marginTop: 3,
            color: colors.textSecondary,
            fontSize: 11,
            lineHeight: 16,
        },
        mapRetryButton: {
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 20,
        },
        noLocationsCard: {
            position: "absolute",
            right: spacing.lg,
            bottom: 76,
            left: spacing.lg,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            padding: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 20,
        },
        noLocationsContent: {
            flex: 1,
        },
        noLocationsTitle: {
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: "800",
        },
        noLocationsDescription: {
            marginTop: 4,
            color: colors.textSecondary,
            fontSize: 12,
            lineHeight: 17,
        },
        pressed: {
            opacity: 0.82,
        },
    });
}
