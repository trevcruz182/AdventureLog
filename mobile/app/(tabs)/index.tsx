import { Ionicons } from "@expo/vector-icons";
import { Pressable, ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { AdventureStatCard } from "@/components/home/AdventureStatCard";
import { CollectionProgressCard } from "@/components/home/CollectionProgressCard";
import { UpcomingAdventureCard } from "@/components/home/UpcomingAdventureCard";
import { FeaturedAdventureCard } from "@/components/home/FeaturedAdventureCard";
import { RecentAdventureCard } from "@/components/home/RecentAdventureCard";
import { OfflineDataState } from "@/components/network/OfflineDataState";
import { useNetworkStatus } from "@/features/network/NetworkProvider";
import { useCollections } from "@/features/collections/useCollections";
import type { AdventureCollection } from "@/types/collection";
import { useAdventures } from "@/features/adventures/useAdventures";
import { useAuth } from "@/features/auth/AuthProvider";
import { ApiError } from "@/lib/api/ApiError";
import { AppColors, spacing, useAppTheme } from "@/theme";
import type { Adventure } from "@/types/adventure";

function getTodayDateValue(): string {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export default function HomeScreen() {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const {user} = useAuth();

    const {isOnline} = useNetworkStatus();

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching
    } = useAdventures({limit: 100});

    const collectionsQuery = useCollections();

    const adventures: Adventure[] = data?.items ?? [];

    const completedAdventures = adventures.filter((adventure) => adventure.status === "completed");

    const plannedAdventures = adventures.filter((adventure) => adventure.status === "wishlist" && adventure.adventure_date >= getTodayDateValue()).sort((first, second) => first.adventure_date.localeCompare(second.adventure_date));

    const upcomingAdventure = plannedAdventures[0] ?? null;

    const collections: AdventureCollection[] = collectionsQuery.data ?? [];

    const activeCollection = [...collections].filter((collection) => collection.adventure_count < collection.target_count).sort((first, second) => {
        const firstProgress = first.target_count > 0 ? first.adventure_count / first.target_count : 0;

        const secondProgress = second.target_count > 0 ? second.adventure_count / second.target_count : 0;

        if(secondProgress !== firstProgress) {
            return secondProgress - firstProgress;
        }

        return second.updated_at.localeCompare(first.updated_at);
    })[0] ?? null;

    const currentYear = new Date().getFullYear();

    const currentYearAdventures = completedAdventures.filter((adventure) => adventure.adventure_date.startsWith(String(currentYear)));

    const featuredAdventure = completedAdventures.find((adventure) => adventure.photos.length > 0) ?? null;

    const recentAdventures = completedAdventures.slice(0, 3);

    const uniquePlaces = new Set(currentYearAdventures.map((adventure) => adventure.location_name.trim().toLowerCase())).size;

    const photoCount = currentYearAdventures.reduce((total, adventure) => total + adventure.photos.length, 0);

    const homeStats = [
        {
            id: "adventures",
            label: "Adventures",
            value: String(currentYearAdventures.length),
            icon: "compass-outline" as const,
        },
        {
            id: "places",
            label: "Places",
            value: String(uniquePlaces),
            icon: "location-outline" as const,
        },
        {
            id: "photos",
            label: "Photos",
            value: String(photoCount),
            icon: "images-outline" as const,
        },
    ]

    const todayLabel = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
    }).format(new Date());

    const firstName = user?.display_name.trim().split(/\s+/)[0] ?? null;

    if(!isOnline && data === undefined) {
        return(
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <OfflineDataState title="Home isn't cached yet" description="Reconnect and open Home once to save your latest adventure overview." />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={isRefetching || collectionsQuery.isRefetching}
                        onRefresh={() => void Promise.all([refetch(), collectionsQuery.refetch()])}
                        tintColor={colors.forest}
                    />
                }
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.eyebrow}>
                            {todayLabel}
                        </Text>
                        <Text style={styles.greeting}>
                            {firstName ? `Ready to wander, ${firstName}?` : "Ready to wander?"}
                        </Text>
                    </View>
                </View>

                {isLoading ? (
                    <View style={styles.featuredState}>
                        <ActivityIndicator size="small" color={colors.forest} />

                        <Text style={styles.featuredStateText}>
                            Finding your latest adventure...
                        </Text>
                    </View>
                ): isError ? (
                    <View style={styles.featuredState}>
                        <Ionicons name="cloud-offline-outline" size={28} color={colors.danger} />

                        <Text style={styles.featuredStateTitle}>
                            Home unavailable
                        </Text>

                        <Text style={styles.featuredStateText}>
                            {error instanceof ApiError ? error.message : "AdventureLog could not load your adventures."}
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
                ) : featuredAdventure ? (
                    <FeaturedAdventureCard 
                        adventure={featuredAdventure}
                        onPress={() => router.push({
                            pathname: "/adventures/[adventureId]",
                            params: {
                                adventureId: featuredAdventure.id
                            }
                        })}
                    />
                ): (
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => router.navigate("/(tabs)/create")}
                        style={({pressed}) => [styles.featuredState, pressed && styles.pressed]}
                    >
                        <Ionicons name="camera-outline" size={30} color={colors.forest} />

                        <Text style={styles.featuredStateTitle}>
                            Your first memory is waiting
                        </Text>

                        <Text style={styles.featuredStateText}>
                            Complete an adventure with a photo to feature it on your Home screen.
                        </Text>
                    </Pressable>
                )}

                {upcomingAdventure ? (
                    <View style={styles.section}>
                        <View style={styles.sectionHeading}>
                            <View>
                                <Text style={styles.sectionEyebrow}>
                                    On the horizon
                                </Text>

                                <Text style={styles.sectionTitle}>
                                    Your next adventure
                                </Text>
                            </View>

                            <Pressable
                                onPress={() => router.navigate("/(tabs)/journal")}
                            >
                                <Text style={styles.linkText}>
                                    View plans
                                </Text>
                            </Pressable>
                        </View>

                        <UpcomingAdventureCard 
                            adventure={upcomingAdventure}
                            onPress={() => router.push({
                                pathname: "/adventures/[adventureId]",
                                params: {
                                    adventureId: upcomingAdventure.id
                                }
                            })}
                        />
                    </View>
                ): null}

                <View style={styles.section}>
                    <View style={styles.sectionHeading}>
                        <View>
                            <Text style={styles.sectionEyebrow}>Your year</Text>
                            <Text style={styles.sectionTitle}>The trail so far</Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        {homeStats.map((stat) => (
                            <AdventureStatCard key={stat.id} {...stat} />
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeading}>
                        <View>
                            <Text style={styles.sectionEyebrow}>
                                In progress
                            </Text>

                            <Text style={styles.sectionTitle}>
                                Keep exploring
                            </Text>
                        </View>

                        <Pressable
                            accessibilityRole="button"
                            onPress={() => router.push("/collections")}
                        >
                            <Text style={styles.linkText}>View all</Text>
                        </Pressable>
                    </View>

                    {!isOnline && collectionsQuery.data === undefined ? (
                        <OfflineDataState 
                            compact
                            title="Collections aren't cached yet"
                            description="Reconnect and open Collections once to save them on this device."
                        />
                    ): collectionsQuery.isLoading ? (
                        <View style={styles.collectionState}>
                            <ActivityIndicator size="small" color={colors.forest} />

                            <Text style={styles.collectionStateText}>
                                Finding your next goal...
                            </Text>
                        </View>
                    ): collectionsQuery.isError ? (
                        <View style={styles.collectionState}>
                            <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />

                            <Text style={styles.collectionStateTitle}>
                                Collections unavailable
                            </Text>

                            <Pressable
                                disabled={collectionsQuery.isRefetching}
                                onPress={() => void collectionsQuery.refetch()}
                            >
                                <Text style={styles.linkText}>
                                    Try again
                                </Text>
                            </Pressable>
                        </View>
                    ): activeCollection ? (
                        <CollectionProgressCard 
                            title={activeCollection.title}
                            description={activeCollection.description}
                            completed={activeCollection.adventure_count}
                            total={activeCollection.target_count}
                            icon={activeCollection.icon}
                            onPress={() => router.push({
                                pathname: "/collections/[collectionId]",
                                params: {
                                    collectionId: activeCollection.id
                                }
                            })}
                        />
                    ): collections.length > 0 ? (
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => router.push("/collections")}
                            style={({pressed}) => [styles.collectionEmptyState, pressed && styles.pressed]}
                        >
                            <View style={styles.collectionEmptyIcon}>
                                <Ionicons name="checkmark-circle-outline" size={25} color={colors.success} />
                            </View>

                            <View style={styles.collectionEmptyContent}>
                                <Text style={styles.collectionEmptyTitle}>
                                    Every goal is complete
                                </Text>

                                <Text style={styles.collectionEmptyText}>
                                    Open Collections to revisit your achievements or create another goal.
                                </Text>
                            </View>

                            <Ionicons name="chevron-forward" size={20} color={colors.forest} />
                        </Pressable>
                    ): (
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => router.push("/collections/create")}
                            style={({pressed}) => [styles.collectionEmptyState, pressed && styles.pressed]}
                        >
                            <View style={styles.collectionEmptyIcon}>
                                <Ionicons name="albums-outline" size={25} color={colors.forest} />
                            </View>

                            <View style={styles.collectionEmptyContent}>
                                <Text style={styles.collectionEmptyTitle}>
                                    Create your first collection
                                </Text>

                                <Text style={styles.collectionEmptyText}>
                                    Group adventures around places, activities, or goals.
                                </Text>
                            </View>

                            <Ionicons name="arrow-forward" size={20} color={colors.forest} />
                        </Pressable>
                    )}
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeading}>
                        <View>
                            <Text style={styles.sectionEyebrow}>Memories</Text>
                            <Text style={styles.sectionTitle}>Recent adventures</Text>
                        </View>

                        <Pressable onPress={() => router.navigate("/(tabs)/journal")}>
                            <Text style={styles.linkText}>Journal</Text>
                        </Pressable>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.recentList}
                    >
                        {recentAdventures.map((adventure) => (
                            <RecentAdventureCard 
                                key={adventure.id} 
                                adventure={adventure}
                                onPress={() => router.push({
                                    pathname: "/adventures/[adventureId]",
                                    params: {
                                        adventureId: adventure.id
                                    }
                                })}
                            />
                        ))}
                    </ScrollView>
                </View>

                {!isLoading && recentAdventures.length === 0 ? (
                    <Pressable
                        onPress={() => router.navigate("/(tabs)/create")}
                        style={styles.recentEmptyState}
                    >
                        <Text style={styles.recentEmptyTitle}>
                            No completed adventures yet
                        </Text>

                        <Text style={styles.recentEmptyText}>
                            Complete an adventure to begin your memory timeline.
                        </Text>
                    </Pressable>
                ): null}

                <Pressable
                    onPress={() => router.navigate("/(tabs)/map")}
                    style={({pressed}) => [
                        styles.promptCard, pressed && styles.pressed
                    ]}
                >
                    <View style={styles.promptIcon}>
                        <Ionicons
                            name="sparkles-outline"
                            size={23}
                            color={colors.forest}
                        />
                    </View>

                    <View style={styles.promptContent}>
                        <Text style={styles.promptEyebrow}>Weekend inspiration</Text>
                        <Text style={styles.promptTitle}>Explore your adventure map</Text>
                    </View>

                    <Ionicons
                        name="arrow-forward"
                        size={20}
                        color={colors.forest}
                    />
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scrollContent: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.xxxl,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: spacing.xl
        },
        eyebrow: {
            color: colors.clay,
            fontSize: 12,
            fontWeight: "800",
            letterSpacing: 1.2,
            textTransform: "uppercase",
        },
        greeting: {
            marginTop: 5,
            color: colors.textPrimary,
            fontSize: 28, 
            fontWeight: "800",
            maxWidth: 280
        },
        pressed: {
            opacity: 0.88
        },
        section: {
            marginTop: spacing.xxl
        },
        sectionHeading: {
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: spacing.md,
        },
        sectionEyebrow: {
            color: colors.textMuted,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 1.2,
            textTransform: "uppercase"
        },
        sectionTitle: {
            marginTop: 3,
            color: colors.textPrimary,
            fontSize: 22,
            fontWeight: "800"
        },
        linkText: {
            color: colors.forest,
            fontSize: 13,
            fontWeight: "800",
        },
        statsRow: {
            flexDirection: "row",
            gap: spacing.sm,
        },
        recentList: {
            gap: spacing.md,
            paddingRight: spacing.lg,
        },
        promptCard: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            marginTop: spacing.xxl,
            padding: spacing.lg,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 24,
        },
        promptIcon: {
            width: 46,
            height: 46,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surface,
            borderRadius: 18,
        },
        promptContent: {
            flex: 1,
        },
        promptEyebrow: {
            color: colors.textMuted,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 0.8,
            textTransform: "uppercase"
        },
        promptTitle: {
            marginTop: 3,
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: "800",
        },
        featuredState: {
            minHeight: 260,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: spacing.xl,
            backgroundColor: colors.surfaceMuted,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 28
        },
        featuredStateTitle: {
            marginTop: spacing.md,
            color: colors.textPrimary,
            fontSize: 19,
            fontWeight: "800",
            textAlign: "center"
        },
        featuredStateText: {
            maxWidth: 290,
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: 13,
            lineHeight: 19,
            textAlign: "center",
        },
        retryButton: {
            marginTop: spacing.lg,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            backgroundColor: colors.forest,
            borderRadius: 999,
        },
        retryButtonText: {
            color: colors.background,
            fontSize: 13,
            fontWeight: "800"
        },
        recentEmptyState: {
            alignItems: "center",
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.xxl,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 22,
        },
        recentEmptyTitle: {
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: "800"
        },
        recentEmptyText: {
            maxWidth: 260,
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: 13,
            lineHeight: 19,
            textAlign: "center"
        },
        collectionState: {
            minHeight: 150,
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            padding: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 24,
        },
        collectionStateTitle: {
            color: colors.textPrimary,
            fontSize: 15,
            fontWeight: "800"
        },
        collectionStateText: {
            color: colors.textSecondary,
            fontSize: 13,
            fontWeight: "600",
            textAlign: "center"
        },
        collectionEmptyState: {
            minHeight: 112,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            padding: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 24,
        },
        collectionEmptyIcon: {
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 18
        },
        collectionEmptyContent: {
            flex: 1
        },
        collectionEmptyTitle: {
            color: colors.textPrimary,
            fontSize: 15,
            fontWeight: "800"
        },
        collectionEmptyText: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: 12,
            lineHeight: 17
        }
    });
}