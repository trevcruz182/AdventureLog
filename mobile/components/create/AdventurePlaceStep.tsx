import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import {FieldErrors, useWatch, Controller, Control, UseFormSetValue} from "react-hook-form";
import { 
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    Platform
} from "react-native";

import { FieldError } from "./FieldError";

import { CreateAdventureFormValues } from "@/features/adventures/createAdventureSchema";
import { AdventureLocationPreview } from "./AdventureLocationPreview";
import { AppColors, spacing, useAppTheme } from "@/theme";
import { useState } from "react";

type AdventurePlaceStepProps = {
    control: Control<CreateAdventureFormValues>;
    errors: FieldErrors<CreateAdventureFormValues>;
    setValue: UseFormSetValue<CreateAdventureFormValues>;
    latitude: number | null;
    longitude: number | null;
};

export function AdventurePlaceStep({control, errors, setValue, latitude, longitude}: AdventurePlaceStepProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);
    
    const [isLocating, setIsLocating] = useState(false);
    const [isGeocoding, setIsGeoCoding] = useState(false);

    const locationName = useWatch({
        control,
        name: "locationName"
    });

    const isResolvingLocation = isLocating || isGeocoding;

    async function ensureGeocodingPermission(): Promise<boolean> {
        if(Platform.OS !== "android") {
            return true;
        }

        const existingPermission = await Location.getForegroundPermissionsAsync();

        if(existingPermission.status === "granted") {
            return true;
        }

        const requestedPermission = await Location.requestForegroundPermissionsAsync();

        if(requestedPermission.status !== "granted") {
            Alert.alert("Location permission needed", "Android requires location permission before AdventureLog can search for coordinates.");

            return false;
        }

        return true;
    }

    async function findTypedLocation() {
        const searchValue = locationName.trim();

        if(searchValue.length < 2) {
            Alert.alert("Enter a location", "Type a place name or address before searching.");

            return;
        }

        try {
            setIsGeoCoding(true);

            const hasPermission = await ensureGeocodingPermission();

            if(!hasPermission) {
                return;
            }

            const results = await Location.geocodeAsync(searchValue);

            const result = results[0];

            if(!result) {
                Alert.alert("Location not found", "Try adding a city, state, or more specific address.");

                return;
            }

            // setValue("latitude", result.latitude, {
            //     shouldDirty: true,
            //     shouldValidate: true,
            // });

            // setValue("longitude", result.longitude, {
            //     shouldDirty: true,
            //     shouldValidate: true, 
            // });

            updateCoordinates(result.latitude, result.longitude);

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        catch {
            Alert.alert("Location search unavailable", "AdventureLog could not find coordinates for that location. Check the name and try again.");
        }
        finally {
            setIsGeoCoding(false);
        }
    }

    async function captureCurrentLocation() {
        try {
            setIsLocating(true);

            const permission = await Location.requestForegroundPermissionsAsync();

            if(permission.status !== "granted") {
                Alert.alert("Location permission needed", "AdventureLog needs access to save your current coordinates.");
                return;
            }

            const result = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Balanced});

            const {latitude, longitude} = result.coords;

            // setValue("latitude", latitude, {
            //     shouldDirty: true,
            //     shouldValidate: true,
            // });
            // setValue("longitude", longitude, {
            //     shouldDirty: true,
            //     shouldValidate: true,
            // });

            updateCoordinates(latitude, longitude);

            const addresses = await Location.reverseGeocodeAsync({latitude, longitude});

            const address = addresses[0];

            if(address) {
                const locationParts = [address.name, address.city, address.region].filter(Boolean);

                const generatedLocationName = Array.from(new Set(locationParts)).join(", ");

                if(generatedLocationName) {
                    setValue("locationName", generatedLocationName, {
                        shouldDirty: true,
                        shouldValidate: true,
                    });
                }
            }

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        catch {
            Alert.alert("Location unavailable", "AdventureLog could not capture your current location.");
        }
        finally {
            setIsLocating(false);
        }
    }

    function updateCoordinates(nextLatitude: number, nextLongitude: number) {
        setValue("latitude", nextLatitude, {
            shouldDirty: true,
            shouldValidate: true,
        });

        setValue("longitude", nextLongitude, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    function clearCoordinates() {
        setValue("latitude", null, {
            shouldDirty: true,
            shouldValidate: true,
        });

        setValue("longitude", null, {
            shouldDirty: true,
            shouldValidate: true
        });
    }

    return(
        <View>
            <Text style={styles.heading}>Place it on the map.</Text>

            <Text style={styles.description}>
                Search for a place or use your current location so the adventure can appear on your map.
            </Text>

            <View style={styles.field}>
                <Text style={styles.label}>Location name</Text>

                <Controller
                    control={control}
                    name="locationName"
                    render={({field: {value, onChange, onBlur}}) => (
                        <View style={styles.iconInput}>
                            <Ionicons name="location-outline" size={20} color={colors.textMuted} />

                            <TextInput
                                value={value}
                                onChangeText={(nextValue) => {
                                    onChange(nextValue);

                                    if(latitude !== null || longitude !== null) {
                                        clearCoordinates();
                                    }
                                }}
                                onBlur={onBlur}
                                placeholder="Bear Mountain, New York"
                                placeholderTextColor={colors.textMuted}
                                returnKeyType="search"
                                onSubmitEditing={() => void findTypedLocation()}
                                style={styles.textInput}
                            />
                        </View>
                    )} 
                />

                <FieldError message={errors.locationName?.message} />
            </View>

            <Pressable
                accessibilityRole="button"
                disabled={isResolvingLocation}
                onPress={() => void findTypedLocation()}
                style={({pressed}) => [styles.locationButton, pressed && !isResolvingLocation && styles.pressed, isResolvingLocation && styles.buttonDisabled]}
            >
                <View style={styles.locationIcon}>
                    {isGeocoding ? (
                        <ActivityIndicator size="small" color={colors.forest} />
                    ): (
                        <Ionicons name="search-outline" size={23} color={colors.forest} />
                    )}
                </View>

                <View style={styles.locationButtonContent}>
                    <Text style={styles.locationButtonTitle}>
                        Find this location
                    </Text>

                    <Text style={styles.locationButtonDescription}>
                        Convert the place name or address into map coordinates.
                    </Text>
                </View>

                <Ionicons name="chevron-forward" size={19} color={colors.textMuted} />
            </Pressable>

            <Pressable
                onPress={() => void captureCurrentLocation()}
                disabled={isResolvingLocation}
                style={({pressed}) => [styles.locationButton, styles.secondaryLocationButton, pressed && !isResolvingLocation && styles.pressed, isResolvingLocation && styles.buttonDisabled]}
            >
                <View style={styles.locationIcon}>
                    {isLocating ? (
                        <ActivityIndicator
                            size="small"
                            color={colors.forest}
                        />
                    ): (
                        <Ionicons name="navigate-outline" size={23} color={colors.forest} />
                    )}
                </View>

                <View style={styles.locationButtonContent}>
                    <Text style={styles.locationButtonTitle}>
                        Use my current location
                    </Text>

                    <Text style={styles.locationButtonDescription}>
                        Save the coordinates for your personal map.
                    </Text>
                </View>

                <Ionicons name="chevron-forward" size={19} color={colors.textMuted} />
            </Pressable>

            {latitude !== null && longitude !== null ? (
                <AdventureLocationPreview 
                    latitude={latitude}
                    longitude={longitude}
                    onChangeCoordinates={updateCoordinates}
                    onClear={clearCoordinates}
                />
                // <View style={styles.coordinateCard}>
                //     <View style={styles.coordinateIcon}>
                //         <Ionicons name="checkmark" size={18} color={colors.background} />
                //     </View>

                //     <View style={styles.coordinateContent}>
                //         <Text style={styles.coordinateTitle}>
                //             Location captured
                //         </Text>

                //         <Text style={styles.coordinateText}>
                //             {latitude.toFixed(5)}, {longitude.toFixed(5)}
                //         </Text>
                //     </View>

                //     <Pressable
                //         onPress={() => {
                //             setValue("latitude", null, {
                //                 shouldDirty: true,
                //                 shouldValidate: true,
                //             });
                //             setValue("longitude", null, {
                //                 shouldDirty: true,
                //                 shouldValidate: true,
                //             });
                //         }}
                //         hitSlop={10}
                //     >
                //         <Ionicons
                //             name="trash-outline"
                //             size={19}
                //             color={colors.danger}
                //         />
                //     </Pressable>
                // </View>
            ): (
                <View style={styles.mapPlaceholder}>
                    <Ionicons name="map-outline" size={34} color={colors.forest} />

                    <Text style={styles.mapPlaceholderTitle}>
                        Find this place on your map
                    </Text>

                    <Text style={styles.mapPlaceholderText}>
                        Enter a place or address above, then search for its coordinates.
                    </Text>
                </View>
            )}
        </View>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        heading: {
            color: colors.textPrimary,
            fontSize: 28,
            fontWeight: "800",
        },
        description: {
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: 15,
            lineHeight: 22,
        },
        field: {
            marginTop: spacing.xl
        },
        label: {
            marginBottom: spacing.sm,
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: "800"
        },
        iconInput: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            minHeight: 54,
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 18,
        },
        textInput: {
            flex: 1,
            color: colors.textPrimary,
            fontSize: 15,
        },
        locationButton: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            marginTop: spacing.xl,
            padding: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 22,
        },
        locationIcon: {
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 17,
        },
        locationButtonContent: {
            flex: 1,
        },
        locationButtonTitle: {
            color: colors.textPrimary,
            fontSize: 15,
            fontWeight: "800"
        },
        locationButtonDescription: {
            marginTop: 3,
            color: colors.textSecondary,
            fontSize: 12,
            lineHeight: 17
        },
        coordinateCard: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            marginTop: spacing.lg,
            padding: spacing.lg,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 20
        },
        coordinateIcon: {
            width: 34,
            height: 34,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.success,
            borderRadius: 17,
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
        mapPlaceholder: {
            alignItems: "center",
            marginTop: spacing.lg,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.xxl,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 24,
        },
        mapPlaceholderTitle: {
            marginTop: spacing.md,
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: "800",
        },
        mapPlaceholderText: {
            maxWidth: 270,
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: 13,
            lineHeight: 19,
            textAlign: "center",
        },
        secondaryLocationButton: {
            marginTop: spacing.md,
        },
        buttonDisabled: {
            opacity: 0.55
        },
        pressed: {
            opacity: 0.82
        }
    });
}