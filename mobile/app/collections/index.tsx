import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FlatList, ActivityIndicator, Pressable, StyleSheet, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCollections } from "@/features/collections/useCollections";
import { ApiError } from "@/lib/api/ApiError";
import { useOnlineAction } from "@/features/network/useOnlineAction";
import type { AdventureCollection } from "@/types/collection";
import { OfflineDataState } from "@/components/network/OfflineDataState";
import { useNetworkStatus } from "@/features/network/NetworkProvider";
import { AppColors, spacing, useAppTheme } from "@/theme";

function CollectionListCard({collection, onPress}: {collection: AdventureCollection; onPress: () => void}) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const progress = Math.min(collection.adventure_count / collection.target_count, 1);

    return(
        <Pressable 
            accessibilityRole="button"
            accessibilityLabel={`Open ${collection.title}`}
            onPress={onPress}
            style={({pressed}) => [styles.card, pressed && styles.cardPressed]}
        >
            <View style={styles.cardTopRow}>
                <View style={styles.iconContainer}>
                    <Ionicons name={collection.icon} size={25} color={colors.clay} />
                </View>

                <Text style={styles.progressCount}>
                    {collection.adventure_count} of{" "}
                    {collection.target_count}
                </Text>
            </View>

            <Text style={styles.cardTitle}>
                {collection.title}
            </Text>

            <Text style={styles.cardDescription} numberOfLines={2}>
                {collection.description || "A personal collection of saved adventures."}
            </Text>

            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, {width: `${progress*100}%`}]} />
            </View>
        </Pressable>
    );
}

export default function CollectionScreen() {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const {isOnline} = useNetworkStatus();

    const runOnline = useOnlineAction();

    const {
        data: collections,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching
    } = useCollections();

    if(!isOnline && collections === undefined) {
        return(
            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                <OfflineDataState
                    title="Collections aren't cached yet"
                    description="Reconnect and open Collections once to save them on this device."
                    onBack={() => router.back()}
                />
            </SafeAreaView>
        );
    }

    if(isLoading) {
        return(
            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                <View style={styles.centerState}>
                    <ActivityIndicator size="small" color={colors.forest} />

                    <Text style={styles.centerTitle}>
                        Opening your collections...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if(isError) {
        const message = error instanceof ApiError ? error.message : "AdventureLog could not load your collections.";

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
                        Collections unavailable
                    </Text>

                    <Text style={styles.centerDescription}>
                        {message}
                    </Text>

                    <Pressable style={styles.retryButton} onPress={() => void refetch()}>
                        <Text style={styles.retryButtonText}>
                            Try again
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

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

                <View style={styles.headerText}>
                    <Text style={styles.eyebrow}>
                        Your trail
                    </Text>

                    <Text style={styles.title}>
                        Collections
                    </Text>
                </View>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Create collection"
                    onPress={() => runOnline(() => router.push("/collections/create"))}
                    style={({pressed}) => [styles.createButton, pressed && styles.pressed]}
                >
                    <Ionicons name="add" size={23} color={colors.background} />
                </Pressable>
            </View>

            <FlatList 
                data={collections ?? []}
                keyExtractor={(collection) => collection.id}
                renderItem={({item}) => (
                    <CollectionListCard 
                        collection={item}
                        onPress={() => router.push({
                            pathname: "/collections/[collectionId]",
                            params: {
                                collectionId: item.id,
                            }
                        })}
                    />
                )}
                refreshControl={
                    <RefreshControl 
                        refreshing={isRefetching}
                        onRefresh={() => void refetch()}
                        tintColor={colors.forest}
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.listContent, collections?.length === 0 && styles.emptyListContent]}
                ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                )}
                ListHeaderComponent={collections && collections.length > 0 ? (
                    <Text style={styles.introduction}>
                        Group meaningful adventures into personal goals and memories.
                    </Text>
                ): null}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Ionicons name="albums-outline" size={32} color={colors.forest} />
                        </View>

                        <Text style={styles.emptyTitle}>
                            Start your first collection
                        </Text>

                        <Text style={styles.emptyDescription}>
                            Collections help you organize adventures around places, activities, and personal goals.
                        </Text>

                        <Pressable
                            accessibilityRole="button"
                            onPress={() => runOnline(() => router.push("/collections/create"))}
                            style={({pressed}) => [styles.emptyAction, pressed && styles.pressed]}
                        >
                            <Ionicons name="add" size={18} color={colors.background} />

                            <Text style={styles.emptyActionText}>
                                Create collection
                            </Text>
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
            backgroundColor: colors.background
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            minHeight: 72,
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
            flex: 1,
        },
        eyebrow: {
            color: colors.clay,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 1.1,
            textTransform: "uppercase"
        },
        title: {
            marginTop: 2,
            color: colors.textPrimary,
            fontSize: 26,
            fontWeight: "800"
        },
        listContent: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.xxxl
        },
        emptyListContent: {
            flexGrow: 1,
        },
        introduction: {
            marginBottom: spacing.lg,
            color: colors.textSecondary,
            fontSize: 14,
            lineHeight: 21,
        },
        separator: {
            height: spacing.md,
        },
        card: {
            padding: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 24,
        },
        cardTopRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
        },
        iconContainer: {
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 18
        },
        progressCount: {
            color: colors.textMuted,
            fontSize: 12,
            fontWeight: "800"
        },
        cardTitle: {
            marginTop: spacing.lg,
            color: colors.textPrimary,
            fontSize: 20,
            fontWeight: "800"
        },
        cardDescription: {
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: 14,
            lineHeight: 20
        },
        progressTrack: {
            height: 8,
            overflow: "hidden",
            marginTop: spacing.lg,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 999
        },
        progressFill: {
            height: "100%",
            backgroundColor: colors.clay,
            borderRadius: 999,
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
            textAlign: "center",
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
        },
        emptyIcon: {
            width: 68,
            height: 68,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 24,
        },
        emptyTitle: {
            marginTop: spacing.lg,
            color: colors.textPrimary,
            fontSize: 21,
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
        pressed: {
            opacity: 0.75
        },
        createButton: {
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.forest,
            borderRadius: 22,
        },
        emptyAction: {
            minHeight: 46,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            marginTop: spacing.lg,
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.forest,
            borderRadius: 999,
        },
        emptyActionText: {
            color: colors.background,
            fontSize: 13,
            fontWeight: "800"
        },
        cardPressed: {
            opacity: 0.88,
            transform: [{scale: 0.99}]
        }
    });
}