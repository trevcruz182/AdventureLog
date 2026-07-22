import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, ActivityIndicator, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAdventures } from "@/features/adventures/useAdventures";
import { useAddAdventureToCollection, useCollection, useRemoveAdventureFromCollection } from "@/features/collections/useCollections";
import { ApiError } from "@/lib/api/ApiError";
import type { Adventure } from "@/types/adventure";
import { AppColors, spacing, useAppTheme } from "@/theme";
import { useMemo, useState } from "react";
import { AdventureCollectionDetail } from "@/types/collection";

const categoryIcons: Record<Adventure["category"], React.ComponentProps<typeof Ionicons>["name"]> = {
    hiking: "trail-sign-outline",
    sports: "trophy-outline",
    travel: "airplane-outline",
    food: "restaurant-outline",
    outdoors: "leaf-outline"
};

type AdventureSelectionRowProps = {
    adventure: Adventure,
    isSelected: boolean;
    isUpdating: boolean;
    onPress: () => void;
};

function AdventureSelectionRow({adventure, isSelected, isUpdating, onPress}: AdventureSelectionRowProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    return(
        <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{
                checked: isSelected,
                disabled: isUpdating
            }}
            accessibilityLabel={`${isSelected ? "Remove" : "Add"} ${adventure.title}`}
            disabled={isUpdating}
            onPress={onPress}
            style={({pressed}) => [styles.adventureRow, isSelected && styles.adventureRowSelected, pressed && !isUpdating && styles.pressed, isUpdating && styles.disabled]}
        >
            {adventure.photos[0]?.image_url ? (
                <Image 
                    source={{uri: adventure.photos[0].image_url}} 
                    style={styles.adventureImage}
                />
            ): (
                <View style={styles.adventurePlaceholder}>
                    <Ionicons name={categoryIcons[adventure.category]} size={25} color={colors.forest} />
                </View>
            )}

            <View style={styles.adventureText}>
                <Text style={styles.adventureTitle} numberOfLines={1}>
                    {adventure.title}
                </Text>

                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={13} color={colors.textMuted} />

                    <Text style={styles.location} numberOfLines={1}>
                        {adventure.location_name}
                    </Text>
                </View>
            </View>

            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isUpdating ? (
                    <ActivityIndicator 
                        size="small"
                        color={isSelected ? colors.background : colors.forest}
                    />
                ): isSelected ? (
                    <Ionicons name="checkmark" size={18} color={colors.background} />
                ): null}
            </View>
        </Pressable>
    );
}

export default function ManageCollectionScreen() {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const [searchQuery, setSearchQuery] = useState("");

    const params = useLocalSearchParams<{collectionId?: string | string[]}>();

    const collectionId = Array.isArray(params.collectionId) ? params.collectionId[0] : params.collectionId;

    const collectionQuery = useCollection(collectionId);

    const adventuresQuery = useAdventures({limit: 100});

    const addMutation = useAddAdventureToCollection();

    const removeMutation = useRemoveAdventureFromCollection();

    const memberIds = useMemo(() => new Set(collectionQuery.data?.adventures.map(
        (adventure: Adventure) => adventure.id) ?? []), 
        [collectionQuery.data]);

    const visibleAdventures = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        const adventures = adventuresQuery.data?.items ?? [];

        if(!normalizedQuery) {
            return adventures;
        }

        return adventures.filter((adventure: Adventure) => adventure.title.toLowerCase().includes(normalizedQuery) || adventure.location_name.toLowerCase().includes(normalizedQuery));
    }, [adventuresQuery.data, searchQuery]);

    async function toggleAdventure(adventure: Adventure) {
        if(!collectionId) {
            return;
        }

        const isSelected = memberIds.has(adventure.id);

        try {
            if(isSelected) {
                await removeMutation.mutateAsync({
                    collectionId, adventureId: adventure.id
                });
            }
            else {
                await addMutation.mutateAsync({
                    collectionId, adventureId: adventure.id
                });
            }

            await Haptics.selectionAsync();
        }
        catch (error) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            const message = error instanceof ApiError ? error.message : "AdventureLog could not update this collection.";

            Alert.alert("Collection not updated", message);
        }
    }

    const isLoading = collectionQuery.isLoading || adventuresQuery.isLoading;

    const isError = collectionQuery.isError || adventuresQuery.isError;

    const isRefetching = collectionQuery.isRefetching || adventuresQuery.isRefetching;

    const mutationAdventureId = addMutation.variables?.adventureId ?? removeMutation.variables?.adventureId;

    if(isLoading) {
        return(
            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                <View style={styles.centerState}>
                    <ActivityIndicator size="small" color={colors.forest} />

                    <Text style={styles.centerTitle}>
                        Preparing your adventures...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if(isError || !collectionQuery.data) {
        const queryError = collectionQuery.error ?? adventuresQuery.error;

        const message = queryError instanceof ApiError ? queryError.message : "AdventureLog could not prepare this collection.";

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
                    <Ionicons name="cloud-offline-outline" size={36} color={colors.danger} />

                    <Text style={styles.centerTitle}>
                        Adventures unavailable
                    </Text>

                    <Text style={styles.centerDescription}>
                        {message}
                    </Text>

                    <Pressable
                        onPress={() => {
                            void Promise.all([collectionQuery.refetch(), adventuresQuery.refetch()]);
                        }}
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

    const collection = collectionQuery.data;

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <View style={styles.header}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    disabled={addMutation.isPending || removeMutation.isPending}
                    onPress={() => router.back()}
                    style={({pressed}) => [styles.headerButton, pressed && styles.pressed]}
                >
                    <Ionicons name="arrow-back" size={21} color={colors.textPrimary} />
                </Pressable>

                <View style={styles.headerText}>
                    <Text style={styles.eyebrow}>
                        {collection.title}
                    </Text>

                    <Text style={styles.title}>
                        Manage adventures
                    </Text>
                </View>

                <Pressable
                    accessibilityRole="button"
                    disabled={addMutation.isPending || removeMutation.isPending}
                    onPress={() => router.back()}
                    style={({pressed}) => [styles.doneButton, pressed && styles.pressed]}
                >
                    <Text style={styles.doneText}>
                        Done
                    </Text>
                </Pressable>
            </View>

            <FlatList 
                data={visibleAdventures}
                keyExtractor={(adventure) => adventure.id}
                renderItem={({item}) => (
                    <AdventureSelectionRow
                        adventure={item}
                        isSelected={memberIds.has(item.id)}
                        isUpdating={mutationAdventureId === item.id && (addMutation.isPending || removeMutation.isPending)}
                        onPress={() => void toggleAdventure(item)}
                    />
                )}
                refreshControl={
                    <RefreshControl 
                        refreshing={isRefetching}
                        onRefresh={() => {
                            void Promise.all([collectionQuery.refetch(), adventuresQuery.refetch()]);
                        }}
                        tintColor={colors.forest}
                    />
                }
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={[styles.listContent, visibleAdventures.length === 0 && styles.emptyListContent]}
                ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                )}
                ListHeaderComponent={
                    <View>
                        <Text style={styles.instructions}>
                            Select the memories that belong in this collection. Changes save automatically.
                        </Text>

                        <View style={styles.searchContainer}>
                            <Ionicons name="search-outline" size={19} color={colors.textMuted} />

                            <TextInput 
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search adventures or places"
                                placeholderTextColor={colors.textMuted}
                                returnKeyType="search"
                                style={styles.searchInput}
                            />

                            {searchQuery.length > 0 ? (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Clear search"
                                    onPress={() => setSearchQuery("")}
                                >
                                    <Ionicons name="close-circle" size={19} color={colors.textMuted} />
                                </Pressable>
                            ): null}
                        </View>

                        <View style={styles.countRow}>
                            <Text style={styles.countText}>
                                {collection.adventure_count} selected
                            </Text>

                            <Text style={styles.goalText}>
                                Goal: {collection.target_count}
                            </Text>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Ionicons name={searchQuery.trim() ? "search-outline" : "book-outline"} size={31} color={colors.forest} />
                        </View>

                        <Text style={styles.emptyTitle}>
                            {searchQuery.trim() ? "No adventures found" : "Your journal is empty"}
                        </Text>

                        <Text style={styles.emptyDescription}>
                            {searchQuery.trim() ? "Try seraching for another title or place." : "Log an adventure before adding memories to a collection."}
                        </Text>

                        {searchQuery.trim() ? (
                            <Pressable
                                onPress={() => setSearchQuery("")}
                                style={styles.resetButton}
                            >
                                <Text style={styles.resetButtonText}>
                                    Clear search
                                </Text>
                            </Pressable>
                        ): null}
                    </View>
                }
            />
        </SafeAreaView>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            minHeight: 72,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            paddingHorizontal: spacing.lg,
        },
        errorHeader: {
            minHeight: 64,
            justifyContent: "center",
            paddingHorizontal: spacing.lg,
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
        headerText: {
            flex: 1
        },
        eyebrow: {
            color: colors.clay,
            fontSize: 10,
            fontWeight: "800",
            letterSpacing: 0.8,
            textTransform: "uppercase"
        },
        title: {
            marginTop: 2,
            color: colors.textPrimary,
            fontSize: 20,
            fontWeight: "800"
        },
        doneButton: {
            minHeight: 42,
            justifyContent: "center",
            paddingHorizontal: spacing.md,
        },
        doneText: {
            color: colors.forest,
            fontSize: 14,
            fontWeight: "800"
        },
        listContent: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.sm,
            paddingBottom: spacing.xxxl,
        },
        emptyListContent: {
            flexGrow: 1,
        },
        instructions: {
            color: colors.textSecondary,
            fontSize: 14,
            lineHeight: 21,
        },
        searchContainer: {
            minHeight: 52,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            marginTop: spacing.lg,
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 18
        },
        searchInput: {
            flex: 1,
            color: colors.textPrimary,
            fontSize: 14
        },
        countRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: spacing.lg,
            marginBottom: spacing.md,
        },
        countText: {
            color: colors.textPrimary,
            fontSize: 13,
            fontWeight: "800"
        },
        goalText: {
            color: colors.textMuted,
            fontSize: 12,
            fontWeight: "700"
        },
        separator: {
            height: spacing.sm,
        },
        adventureRow: {
            minHeight: 84,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            padding: spacing.md,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 20,
        },
        adventureRowSelected: {
            borderColor: colors.forest,
            backgroundColor: colors.surfaceElevated
        },
        adventureImage: {
            width: 60,
            height: 60,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 16
        },
        adventurePlaceholder: {
            width: 60,
            height: 60,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 16,
        },
        adventureText: {
            flex: 1,
        },
        adventureTitle: {
            color: colors.textPrimary,
            fontSize: 15,
            fontWeight: "800"
        },
        locationRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 3,
            marginTop: spacing.xs
        },
        location: {
            flex: 1,
            color: colors.textSecondary,
            fontSize: 12,
        },
        checkbox: {
            width: 30,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: colors.border,
            borderRadius: 10,
        },
        checkboxSelected: {
            backgroundColor: colors.forest,
            borderColor: colors.forest,
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
        emptyState: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: spacing.xl,
            paddingBottom: spacing.xxxl,
        },
        emptyIcon: {
            width: 66,
            height: 66,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 23,
        },
        emptyTitle: {
            marginTop: spacing.lg,
            color: colors.textPrimary,
            fontSize: 19,
            fontWeight: "800",
            textAlign: "center"
        },
        emptyDescription: {
            maxWidth: 300,
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: 14,
            lineHeight: 21,
            textAlign: "center"
        },
        resetButton: {
            marginTop: spacing.lg,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            backgroundColor: colors.forest,
            borderRadius: 999
        },
        resetButtonText: {
            color: colors.background,
            fontSize: 13,
            fontWeight: "800"
        },
        pressed: {
            opacity: 0.76,
        },
        disabled: {
            opacity: 0.55
        }
    });
}