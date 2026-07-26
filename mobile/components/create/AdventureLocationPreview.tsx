import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, {Marker, Region} from "react-native-maps";

import { AppColors, spacing, useAppTheme } from "@/theme";

type AdventureLocationPreviewProps = {
    latitude: number;
    longitude: number;
    onChangeCoordinates: (latitude: number, longitude: number) => void;
    onClear: () => void;
};

function createRegion(latitude: number, longitude: number): Region {
    return {
        latitude,
        longitude,
        latitudeDelta: 0.025,
        longitudeDelta: 0.025
    };
}

export function AdventureLocationPreview({longitude, latitude, onChangeCoordinates, onClear}: AdventureLocationPreviewProps) {
    const {colors, isDark} = useAppTheme();

    const styles = createStyles(colors);

    const mapRef = useRef<MapView | null>(null);

    useEffect(() => {
        mapRef.current?.animateToRegion(createRegion(latitude, longitude), 350);
    }, [latitude, longitude]);

    return(
        <View style={styles.container}>
            <View style={styles.mapWrapper}>
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFill}
                    initialRegion={createRegion(latitude, longitude)}
                    userInterfaceStyle={isDark ? "dark" : "light"}
                    showsCompass={false}
                    showsMyLocationButton={false}
                    toolbarEnabled={false}
                    onLongPress={(event) => {
                        const coordinate = event.nativeEvent.coordinate;

                        onChangeCoordinates(coordinate.latitude, coordinate.longitude);
                    }}
                >
                    <Marker 
                        coordinate={{latitude, longitude}}
                        draggable
                        pinColor={colors.clay}
                        title="Adventure location"
                        description="Drag this pin to adjust the location."
                        onDragEnd={(event) => {
                            const coordinate = event.nativeEvent.coordinate;
                            
                            onChangeCoordinates(coordinate.latitude, coordinate.longitude);
                        }}
                    />
                </MapView>

                <View style={styles.instructionBadge} pointerEvents="none">
                    <Ionicons name="move-outline" size={14} color="#FFFFFF" />

                    <Text style={styles.instructionText}>
                        Drag the pin or hold the map
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.confirmationIcon}>
                    <Ionicons name="checkmark" size={18} color={colors.background} />
                </View>

                <View style={styles.coordinateContent}>
                    <Text style={styles.coordinateTitle}>
                        Location confirmed
                    </Text>

                    <Text style={styles.coordinateText}>
                        {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </Text>
                </View>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Remove saved coordinates"
                    onPress={onClear}
                    hitSlop={10}
                    style={({pressed}) => [styles.clearButton, pressed && styles.pressed]}
                >
                    <Ionicons name="trash-outline" size={19} color={colors.danger} />
                </Pressable>
            </View>
        </View>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        container: {
            overflow: "hidden",
            marginTop: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 24,
        },
        mapWrapper: {
            position: "relative",
            height: 240,
            backgroundColor: colors.surfaceMuted
        },
        instructionBadge: {
            position: "absolute",
            top: spacing.md,
            alignSelf: "center",
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: "rgba(17, 23, 19, 0.72)",
            borderRadius: 999
        },
        instructionText: {
            color: "#FFFFFF",
            fontSize: 11,
            fontWeight: "800"
        },
        footer: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            padding: spacing.lg,
        },
        confirmationIcon: {
            width: 34,
            height: 34,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.success,
            borderRadius: 17
        },
        coordinateContent: {
            flex: 1,
        },
        coordinateTitle: {
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: "800"
        },
        coordinateText: {
            marginTop: 3,
            color: colors.textSecondary,
            fontSize: 12,
        },
        clearButton: {
            width: 38,
            height: 38,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 19
        },
        pressed: {
            opacity: 0.7
        }
    });
}