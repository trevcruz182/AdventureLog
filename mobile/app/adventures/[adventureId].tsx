import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent, useWindowDimensions, Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAdventure, useDeleteAdventure, useToggleAdventureFavorite } from "@/features/adventures/useAdventures";
import { ApiError } from "@/lib/api/ApiError";
import type { Adventure, AdventureCategory } from "@/types/adventure";
import { AppColors, spacing, useAppTheme } from "@/theme";
import { useState } from "react";

const categoryLabels: Record<AdventureCategory, string> = {
    hiking: "Hiking",
    sports: "Sports",
    travel: "Travel",
    food: "Food",
    outdoors: "Outdoors"
};

const categoryIcons: Record<AdventureCategory, React.ComponentProps<typeof Ionicons>["name"]> = {
    hiking: "trail-sign-outline",
    sports: "trophy-outline",
    travel: "airplane-outline",
    food: "restaurant-outline",
    outdoors: "leaf-outline"
};

function formatAdventureDate(value: string): string {
    const [year, month, day] = value.split("-").map(Number);

    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    }).format(new Date(year, month - 1, day));
}

function getCoordinate(value: string | number | null): number | null {
    if(value === null) {
        return null;
    }

    const coordinate = Number(value);

    return Number.isFinite(coordinate) ? coordinate : null;
}

export default function AdventureDetailScreen() {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);
    
    const {width: screenWidth} = useWindowDimensions();

    const [activePhotoIndex, setActivePhotoIndex] = useState(0);

    const params = useLocalSearchParams<{adventureId?: string | string[]}>();

    const adventureId = Array.isArray(params.adventureId) ? params.adventureId[0] : params.adventureId;

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching
    } = useAdventure(adventureId);

    const adventure: Adventure | undefined = data;

    const favoriteMutation = useToggleAdventureFavorite();

    const deleteMutation = useDeleteAdventure();

    function confirmDelete(currentAdventure: Adventure) {
        Alert.alert("Delete adventure?", `"${currentAdventure.title}" and its uploaded photos will be permanently deleted.`, [
            {
                text: "Cancel",
                style: "cancel"
            },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteMutation.mutateAsync(currentAdventure.id);

                        router.back();
                    }
                    catch (mutationError) {
                        const message = mutationError instanceof ApiError ? mutationError.message : "AdventureLog could not delete this adventure.";

                        Alert.alert("Adventure not deleted", message);
                    }
                }
            }
        ]);
    }

    async function toggleFavorite(currentAdventure: Adventure) {
        try {
            await favoriteMutation.mutateAsync({
                adventureId: currentAdventure.id,
                isFavorite: !currentAdventure.is_favorite
            });
        }
        catch (mutationError) {
            const message = mutationError instanceof ApiError ? mutationError.message : "AdventureLog could not update this adventure.";

            Alert.alert("Favorite not updated", message);
        }
    }

    function handlePhotoScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
        const nextIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);

        setActivePhotoIndex(nextIndex);
    }

    if(isLoading) {
        return(
            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                <View style={styles.centerState}>
                    <ActivityIndicator size="small" color={colors.forest} />

                    <Text style={styles.centerTitle}>
                        Opening adventure...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if(isError || !adventure) {
        const message = error instanceof ApiError ? error.message : "AdventureLog could not load this adventure.";

        return(
            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                <View style={styles.errorHeader}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                        onPress={() => router.back()}
                        style={styles.headerButton}
                    >
                        <Ionicons name="arrow-back" size={21} color={colors.textPrimary} />
                    </Pressable>
                </View>

                <View style={styles.centerState}>
                    <Ionicons name="cloud-offline-outline" size={38} color={colors.danger} />

                    <Text style={styles.centerTitle}>
                        Adventure unavailable
                    </Text>

                    <Text style={styles.centerDescription}>
                        {message}
                    </Text>

                    <Pressable
                        onPress={() => void refetch()}
                        style={styles.retryButton}
                    >
                        <Text style={styles.retryButtonText}>
                            Try again
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const latitude = getCoordinate(adventure.latitude);

    const longitude = getCoordinate(adventure.longitude);

    const hasCoordinates = latitude !== null && longitude !== null;

    const isUpdating = favoriteMutation.isPending || deleteMutation.isPending;

    return(
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <View style={styles.header}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    disabled={isUpdating}
                    onPress={() => router.back()}
                    style={({pressed}) => [styles.headerButton, pressed && styles.pressed]}
                >
                    <Ionicons name="arrow-back" size={21} color={colors.textPrimary} />
                </Pressable>

                <View style={styles.headerActions}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={adventure.is_favorite ? "Remove from favorites" : "Add to favorites"}
                        disabled={isUpdating}
                        onPress={() => void toggleFavorite(adventure)}
                        style={({pressed}) => [styles.headerButton, pressed && styles.pressed, isUpdating && styles.disabled]}
                    >
                        {favoriteMutation.isPending ? (
                            <ActivityIndicator size="small" color={colors.forest} />
                        ): (
                            <Ionicons name={adventure.is_favorite ? "heart" : "heart-outline"} size={21} color={adventure.is_favorite ? colors.clay : colors.textPrimary} />
                        )}
                    </Pressable>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Delete adventure"
                        disabled={isUpdating}
                        onPress={() => confirmDelete(adventure)}
                        style={({pressed}) => [styles.headerButton, pressed && styles.pressed, isUpdating && styles.disabled]}
                    >
                        {deleteMutation.isPending ? (
                            <ActivityIndicator size="small" color={colors.danger} />
                        ): (
                            <Ionicons name="trash-outline" size={20} color={colors.danger} />
                        )}
                    </Pressable>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={isRefetching}
                        onRefresh={() => void refetch()}
                        tintColor={colors.forest}
                    />
                }
                contentContainerStyle={styles.content}
            >
                {adventure.photos.length > 0 ? (
                    <View style={styles.photoCarousel}>
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={handlePhotoScrollEnd}
                            bounces={false}
                            style={styles.photoScroller}
                        >
                            {adventure.photos.map((photo) => (
                                <Image 
                                    key={photo.id} 
                                    source={{uri: photo.image_url}} 
                                    resizeMode="cover"
                                    style={[styles.photo, {width: screenWidth}]} 
                                />
                            ))}
                        </ScrollView>

                        {adventure.photos.length > 1 ? (
                            <View style={styles.photoIndicator}>
                                <Text style={styles.photoIndicatorText}>
                                    {activePhotoIndex + 1} /{" "}
                                    {adventure.photos.length}
                                </Text>
                            </View>
                        ): null}
                    </View>
                ): (
                    <View style={styles.photoPlaceholder}>
                        <Ionicons name={categoryIcons[adventure.category]} size={46} color={colors.forest} />

                        <Text style={styles.placeholderLabel}>
                            {categoryLabels[adventure.category]}
                        </Text>
                    </View>
                )}

                <View style={styles.body}>
                    <View style={styles.categoryRow}>
                        <View style={styles.categoryBadge}>
                            <Ionicons name={categoryIcons[adventure.category]} size={15} color={colors.forest} />
                        </View>

                        <Text style={styles.categoryText}>
                            {categoryLabels[adventure.category]}
                        </Text>
                    </View>

                    {adventure.is_favorite ? (
                        <View style={styles.favoriteBadge}>
                            <Ionicons name="heart" size={14} color={colors.clay} />

                            <Text style={styles.favoriteText}>
                                Favorite
                            </Text>
                        </View>
                    ): null}
                
                    <Text style={styles.title}>
                        {adventure.title}
                    </Text>

                    <Text style={styles.date}>
                        {formatAdventureDate(adventure.adventure_date)}
                    </Text>

                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={18} color={colors.clay} />

                        <Text style={styles.location}>
                            {adventure.location_name}
                        </Text>
                    </View>

                    <View style={styles.ratingRow}>
                        {Array.from({length: 5}, (_, index) => (
                            <Ionicons key={index} name={index < adventure.rating ? "star" : "star-outline"} size={19} color={colors.clay} />
                        ))}
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionLabel}>
                        The memory
                    </Text>

                    <Text style={styles.description}>
                        {adventure.description || "No journal note was added for this adventure."}
                    </Text>

                    {hasCoordinates ? (
                        <>
                            <View style={styles.divider} />

                            <Text style={styles.sectionLabel}>
                                Coordinates
                            </Text>

                            <Text style={styles.coordinates}>
                                {latitude.toFixed(6)},{" "}
                                {longitude.toFixed(6)}
                            </Text>
                        </>
                    ): null}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.background
        },
        header: {
            minHeight: 64,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.background
        },
        errorHeader: {
            minHeight: 64,
            justifyContent: "center",
            paddingHorizontal: spacing.lg,
        },
        headerActions: {
            flexDirection: "row",
            gap: spacing.sm,
        },
        headerButton: {
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 22,
        },
        content: {
            paddingBottom: spacing.xxl,
        },
        photoScroller: {
            width: "100%"
        },
        photo: {
            height: 310,
            backgroundColor: colors.surfaceMuted
        },
        photoPlaceholder: {
            height: 280,
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            backgroundColor: colors.surfaceMuted
        },
        photoCarousel: {
            position: "relative"
        },
        photoIndicator: {
            position: "absolute",
            right: spacing.lg,
            bottom: spacing.lg,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: "rgba(0, 0, 0, 0.62)",
            borderRadius: 999
        },
        photoIndicatorText: {
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: "800"
        },
        placeholderLabel: {
            color: colors.textSecondary,
            fontSize: 14,
            fontWeight: "800"
        },
        body: {
            width: "100%",
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.xl
        },
        categoryRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.md,
        },
        categoryBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 999,
        },
        categoryText: {
            color: colors.forest,
            fontSize: 12,
            fontWeight: "800"
        },
        favoriteBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
        },
        favoriteText: {
            color: colors.clay,
            fontSize: 12,
            fontWeight: "800"
        },
        title: {
            marginTop: spacing.lg,
            color: colors.textPrimary,
            fontSize: 32,
            fontWeight: "800",
            lineHeight: 38,
        },
        date: {
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: 14,
            fontWeight: "600"
        },
        locationRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            marginTop: spacing.lg
        },
        location: {
            flex: 1,
            color: colors.textPrimary,
            fontSize: 15,
            fontWeight: "700"
        },
        ratingRow: {
            flexDirection: "row",
            gap: 4,
            marginTop: spacing.lg
        },

        divider: {
            height: StyleSheet.hairlineWidth,
            marginVertical: spacing.xl,
            backgroundColor: colors.border,
        },
        sectionLabel: {
            color: colors.textMuted,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 1.1,
            textTransform: "uppercase"
        },
        description: {
            marginTop: spacing.md,
            color: colors.textPrimary,
            fontSize: 16,
            lineHeight: 25
        },
        coordinates: {
            marginTop: spacing.md,
            color: colors.textSecondary,
            fontSize: 14,
            fontWeight: "700"
        },
        centerState: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: spacing.xl,
        },
        centerTitle: {
            marginTop: spacing.lg,
            color: colors.textPrimary,
            fontSize: 20,
            fontWeight: "800",
            textAlign: "center"
        },
        centerDescription: {
            maxWidth: 300,
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: 14,
            lineHeight: 21,
            textAlign: "center"
        },
        retryButton: {
            marginTop: spacing.lg,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
            backgroundColor: colors.forest,
            borderRadius: 999
        },
        retryButtonText: {
            color: colors.background,
            fontSize: 13,
            fontWeight: "800"
        },
        pressed: {
            opacity: 0.75
        },
        disabled: {
            opacity: 0.55
        }
    });
}