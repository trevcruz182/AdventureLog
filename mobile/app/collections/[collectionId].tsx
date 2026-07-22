import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { FlatList, Alert, ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { JournalAdventureCard } from "@/components/journal/JournalAdventureCard";
import { useCollection, useDeleteCollection } from "@/features/collections/useCollections";
import type { AdventureCollectionDetail } from "@/types/collection";
import { ApiError } from "@/lib/api/ApiError";
import { AppColors, spacing, useAppTheme } from "@/theme";

export default function CollectionDetailScreen() {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const params = useLocalSearchParams<{collectionId?: string | string[]}>();

    const deleteMutation = useDeleteCollection();

    const collectionId = Array.isArray(params.collectionId) ? params.collectionId[0] : params.collectionId;

    const {
        data: collection,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching
    } = useCollection(collectionId);

    if(isLoading) {
        return(
            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                <View style={styles.centerState}>
                    <ActivityIndicator size="small" color={colors.forest} />

                    <Text style={styles.centerTitle}>
                        Opening collection...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if(isError || !collection) {
        const message = error instanceof ApiError ? error.message : "AdventureLog could not load this collection.";

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
                        Collection unavailable
                    </Text>

                    <Text style={styles.centerDescription}>
                        {message}
                    </Text>

                    <Pressable
                        onPress={() => void refetch()}
                        style={({pressed}) => [styles.retryButton, pressed && styles.pressed]}
                    >
                        <Text style={styles.retryButtonText}>
                            Try again
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const isDeleting = deleteMutation.isPending;

    function confirmDelete(currentCollection: AdventureCollectionDetail) {
        Alert.alert("Delete collection?", `"${currentCollection.title}" will be deleted. Its adventures and photos will remain in your Journal.`, [
            {
                text: "Cancel",
                style: "cancel"
            },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteMutation.mutateAsync(currentCollection.id);

                        router.back();
                    }
                    catch (deleteError) {
                        const message = deleteError instanceof ApiError ? deleteError.message : "AdventureLog could not delete this collection.";

                        Alert.alert("Collection not deleted", message);
                    }
                }
            }
        ])
    }

    const progress = Math.min(collection.adventure_count / collection.target_count, 1);

    return(
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <View style={styles.header}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    onPress={() => router.back()}
                    style={({pressed}) => [styles.headerButton, pressed && styles.pressed]}
                >
                    <Ionicons name="arrow-back" size={21} color={colors.textPrimary} />
                </Pressable>

                <Text style={styles.headerTitle} numberOfLines={1}>
                    Collection
                </Text>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Manage collection adventures"
                    onPress={() => router.push({
                        pathname: "/collections/manage",
                        params: {
                            collectionId: collection.id
                        }
                    })}
                    style={({pressed}) => [styles.manageHeaderButton, pressed && styles.pressed]}
                >
                    <Ionicons name="add" size={22} color={colors.background} />
                </Pressable>
            </View>

            <FlatList 
                data={collection.adventures}
                keyExtractor={(adventure) => adventure.id}
                renderItem={({item}) => (
                    <JournalAdventureCard 
                        adventure={item}
                        onPress={() => router.push({
                            pathname: "/adventures/[adventureId]",
                            params: {
                                adventureId: item.id,
                            }
                        })}
                    />
                )}
                ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                )}
                refreshControl={
                    <RefreshControl 
                        refreshing={isRefetching}
                        onRefresh={() => void refetch()}
                        tintColor={colors.forest}
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.content, collection.adventures.length === 0 && styles.emptyContent]}
                ListHeaderComponent={
                    <View style={styles.summary}>
                        <View style={styles.iconContainer}>
                            <Ionicons name={collection.icon} size={30} color={colors.clay} />
                        </View>

                        <Text style={styles.eyebrow}>
                            Adventure collection
                        </Text>

                        <Text style={styles.title}>
                            {collection.title}
                        </Text>

                        <Text style={styles.description}>
                            {collection.description || "A personal collection of saved adventures."}
                        </Text>

                        <View style={styles.progressRow}>
                            <Text style={styles.progressLabel}>
                                Collection progress
                            </Text>

                            <Text style={styles.progressValue}>
                                {collection.adventure_count}{" "} of {collection.target_count}
                            </Text>
                        </View>

                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, {width: `${progress * 100}%`}]} />
                        </View>

                        <View style={styles.collectionActions}>
                            <Pressable
                                accessibilityRole="button"
                                disabled={isDeleting}
                                onPress={() => router.push({
                                    pathname: "/collections/edit",
                                    params: {
                                        collectionId: collection.id
                                    }
                                })}
                                style={({pressed}) => [styles.editAction, pressed && styles.pressed]}
                            >
                                <Ionicons name="pencil-outline" size={17} color={colors.forest} />

                                <Text style={styles.editActionText}>
                                    Edit collection
                                </Text>
                            </Pressable>
                        </View>

                        <View style={styles.divider} />

                        <Text style={styles.adventuresTitle}>
                            Adventures
                        </Text>

                        {collection.adventures.length > 0 ? (
                            <Text style={styles.adventuresDescription}>
                                Memories currently included in this collection.
                            </Text>
                        ): null}
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Ionicons name="images-outline" size={31} color={colors.forest} />
                        </View>

                        <Text style={styles.emptyTitle}>
                            No adventures added yet
                        </Text>

                        <Text style={styles.emptyDescription}>
                            Choose memories from your Adventure Journal to begin this collection.
                        </Text>

                        <Pressable
                            accessibilityRole="button"
                            onPress={() => router.push({
                                pathname: "/collections/manage",
                                params: {
                                    collectionId: collection.id
                                }
                            })}
                            style={({pressed}) => [styles.manageAction, pressed && styles.pressed]}
                        >
                            <Ionicons name="add" size={18} color={colors.background} />

                            <Text style={styles.manageActionText}>
                                Add adventures
                            </Text>
                        </Pressable>
                    </View>
                }
                ListFooterComponent={
                    <View style={styles.dangerZone}>
                        <View style={styles.divider} />

                        <Text style={styles.dangerLabel}>
                            Collection settings
                        </Text>

                        <Text style={styles.dangerDescription}>
                            Deleting this collection will not delete any adventures or photos.
                        </Text>

                        <Pressable
                            accessibilityRole="button"
                            disabled={isDeleting}
                            onPress={() => confirmDelete(collection)}
                            style={({pressed}) => [styles.deleteButton, pressed && !isDeleting && styles.pressed, isDeleting && styles.disabled]}
                        >
                            {isDeleting ? (
                                <ActivityIndicator size="small" color={colors.danger} />
                            ): (
                                <>
                                    <Ionicons name="trash-outline" size={18} color={colors.danger} />

                                    <Text style={styles.deleteButtonText}>
                                        Delete collection
                                    </Text>
                                </>
                            )}
                        </Pressable>
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
            minHeight: 64,
            flexDirection: "row",
            alignItems: "center",
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
        headerTitle: {
            flex: 1,
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: "800",
            textAlign: "center"
        },
        manageHeaderButton: {
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.forest,
            borderRadius: 22,
        },
        content: {
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xxxl,
        },
        emptyContent: {
            flexGrow: 1,
        },
        summary: {
            paddingTop: spacing.md,
            paddingBottom: spacing.xl,
        },
        iconContainer: {
            width: 64,
            height: 64,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 23,
        },
        eyebrow: {
            marginTop: spacing.lg,
            color: colors.clay,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 1.1,
            textTransform: "uppercase"
        },
        title: {
            marginTop: spacing.sm,
            color: colors.textPrimary,
            fontSize: 31,
            fontWeight: "800",
            lineHeight: 37
        },
        description: {
            marginTop: spacing.md,
            color: colors.textSecondary,
            fontSize: 15,
            lineHeight: 22,
        },
        progressRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: spacing.xl,
        },
        progressLabel: {
            color: colors.textPrimary,
            fontSize: 13,
            fontWeight: "800"
        },
        progressValue: {
            color: colors.textSecondary,
            fontSize: 12,
            fontWeight: "700"
        },
        progressTrack: {
            height: 9,
            overflow: "hidden",
            marginTop: spacing.sm,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 999
        },
        progressFill: {
            height: "100%",
            backgroundColor: colors.clay,
            borderRadius: 999,
        },
        divider: {
            height: StyleSheet.hairlineWidth,
            marginVertical: spacing.xl,
            backgroundColor: colors.border
        },
        adventuresTitle: {
            color: colors.textPrimary,
            fontSize: 21,
            fontWeight: "800"
        },
        adventuresDescription: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: 13,
            lineHeight: 19
        },
        separator: {
            height: spacing.lg,
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
            borderRadius: 23
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
            borderRadius: 999,
        },
        retryButtonText: {
            color: colors.background,
            fontSize: 13,
            fontWeight: "800"
        },
        pressed: {
            opacity: 0.75
        },
        manageAction: {
            minHeight: 46,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            marginTop: spacing.lg,
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.forest,
            borderRadius: 999
        },
        manageActionText: {
            color: colors.background,
            fontSize: 13,
            fontWeight: "800"
        },
        collectionActions: {
            flexDirection: "row",
            marginTop: spacing.lg,
        },
        editAction: {
            minHeight: 44,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 999
        },
        editActionText: {
            color: colors.forest,
            fontSize: 13,
            fontWeight: "800"
        },
        dangerZone: {
            paddingTop: spacing.lg,
            paddingBottom: spacing.xl,
        },
        dangerLabel: {
            color: colors.danger,
            fontSize: 12,
            fontWeight: "800",
            letterSpacing: 0.8,
            textTransform: "uppercase"
        },
        dangerDescription: {
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: 13,
            lineHeight: 19
        },
        deleteButton: {
            minHeight: 48,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            marginTop: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.danger,
            borderRadius: 18
        },
        deleteButtonText: {
            color: colors.danger,
            fontSize: 13,
            fontWeight: "800"
        },
        disabled: {
            opacity: 0.55
        }
    });
}