import { Ionicons } from "@expo/vector-icons";
import { Pressable, ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { AdventureStatCard } from "@/components/home/AdventureStatCard";
import { CollectionProgressCard } from "@/components/home/CollectionProgressCard";
import { FeaturedAdventureCard } from "@/components/home/FeaturedAdventureCard";
import { RecentAdventureCard } from "@/components/home/RecentAdventureCard";
// import { activeCollection, featuredAdventure, homeStats, recentAdventures } from "@/data/home";
import { activeCollection } from "@/data/home";
import { useAdventures } from "@/features/adventures/useAdventures";
import { useAuth } from "@/features/auth/AuthProvider";
import { ApiError } from "@/lib/api/ApiError";
import { AppColors, spacing, useAppTheme } from "@/theme";
import { Adventure } from "@/types/adventure";

export default function HomeScreen() {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const {user} = useAuth();

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching
    } = useAdventures({limit: 100});

    const adventures: Adventure[] = data?.items ?? [];

    const currentYear = new Date().getFullYear();

    const currentYearAdventures = adventures.filter((adventure) => adventure.adventure_date.startsWith(String(currentYear)));

    const featuredAdventure = adventures.find((adventure) => adventure.photos.length > 0) ?? null;

    const recentAdventures = adventures.slice(0, 3);

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

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={isRefetching}
                        onRefresh={() => void refetch()}
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

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Open notifications"
                        style={({pressed}) => [
                            styles.notifcationButton, pressed && styles.pressed,
                        ]}
                    >
                        <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />

                        <View style={styles.notifcationDot} />
                    </Pressable>
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
                            Your next story starts here
                        </Text>

                        <Text style={styles.featuredStateText}>
                            Log an adventure with a photo to feature it on your Home screen.
                        </Text>
                    </Pressable>
                )}

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
                            <Text style={styles.sectionEyebrow}>In progress</Text>
                            <Text style={styles.sectionTitle}>Keep exploring</Text>
                        </View>

                        <Pressable>
                            <Text style={styles.linkText}>View all</Text>
                        </Pressable>
                    </View>

                    <CollectionProgressCard {...activeCollection} />
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
                            No adventures yet
                        </Text>

                        <Text style={styles.recentEmptyText}>
                            Log your first adventure to begin your timeline.
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
        notifcationButton: {
            position: "relative",
            width: 46,
            height: 46,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 23,
        },
        notifcationDot: {
            position: "absolute",
            top: 11,
            right: 11,
            width: 7,
            height: 7,
            backgroundColor: colors.clay,
            borderRadius: 4,
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
        }
    });
}