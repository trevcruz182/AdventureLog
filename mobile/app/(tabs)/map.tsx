import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRef, useState } from "react";

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
import { AdventureCategory } from "@/data/home";
import { MapAdventure, mapAdventures } from "@/data/map";
import { AppColors, spacing, useAppTheme } from "@/theme";

type MapFilter = "all" | AdventureCategory;

const initialRegion: Region = {
    latitude: 41.37,
    longitude: -73.86,
    latitudeDelta: 0.38,
    longitudeDelta: 0.38
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

export default function MapScreen() {
    const {colors, isDark} = useAppTheme();
    const styles = createStyles(colors);

    const mapRef = useRef<MapView>(null);

    const [selectedAdventure, setSelectedAdventure] = useState<MapAdventure | null>(null);

    const [selectedFilter, setSelectedFilter] = useState<MapFilter>("all");

    const [mapType, setMapType] = useState<MapType>("standard");

    const [isLocating, setIsLocating] = useState(false);

    const visibleAdventures = mapAdventures.filter((adventure) => selectedFilter === "all" || adventure.category === selectedFilter);

    function handleSelectAdventure(adventure: MapAdventure) {
        setSelectedAdventure(adventure);

        mapRef.current?.animateToRegion({
            latitude: adventure.latitude - 0.015,
            longitude: adventure.longitude,
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

    return(
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <View style={styles.container}>
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFill}
                    initialRegion={initialRegion}
                    mapType={mapType}
                    showsCompass={false}
                    showsUserLocation
                    showsMyLocationButton={false}
                    userInterfaceStyle={isDark ? "dark" : "light"}
                    onPress={() => setSelectedAdventure(null)}
                >
                    {visibleAdventures.map((adventure) => (
                        <AdventureMapMarker 
                            key={adventure.id}
                            adventure={adventure}
                            isSelected={selectedAdventure?.id === adventure.id}
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
                                        setSelectedAdventure(null);
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
                    <MapAdventurePreview adventure={selectedAdventure} onClose={() => setSelectedAdventure(null)} />
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
        pressed: {
            opacity: 0.82,
        },
    });
}