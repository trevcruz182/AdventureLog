import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AchievementProgressCard } from "@/components/achievements/AchievementProgressCard";
import { OfflineDataState } from "@/components/network/OfflineDataState";
import { getAdventureAchievements } from "@/features/achievements/achievementProgress";
import { useAdventures } from "@/features/adventures/useAdventures";
import { useCollections } from "@/features/collections/useCollections";
import { useNetworkStatus } from "@/features/network/NetworkProvider";
import { ApiError } from "@/lib/api/ApiError";
import type { Adventure } from "@/types/adventure";
import { AppColors, spacing, useAppTheme } from "@/theme";

export default function AchievementsScreen() {
    const {colors} = useAppTheme();
    const {isOnline} = useNetworkStatus();
    const styles = createStyles(colors);

    const adventuresQuery = useAdventures({limit: 100});

    const collectionsQuery = useCollections();

    const adventures: Adventure[] = adventuresQuery.data?.items ?? [];

    const collections = collectionsQuery.data ?? [];

    const achievements = getAdventureAchievements(adventures, collections);

    const earnedAchievements = achievements.filter((achievement) => achievement.isEarned);

    const lockedAchievements = achievements.filter((achievement) => !achievement.isEarned);

    const isLoading = adventuresQuery.isLoading || collectionsQuery.isLoading;

    const isRefetching = adventuresQuery.isRefetching || collectionsQuery.isRefetching;

    const isError = adventuresQuery.isError || collectionsQuery.isError;

    const hasMissingOfflineData = !isOnline && (adventuresQuery.data === undefined || collectionsQuery.data === undefined);

    function refreshData() {
        void Promise.all([adventuresQuery.refetch(), collectionsQuery.refetch()]);
    }

    if(hasMissingOfflineData) {
        return(
            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                <View style={styles.header}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={21} color={colors.textPrimary} />
                    </Pressable>
                </View>

                <OfflineDataState 
                    title="Achievements aren't cached yet"
                    description="Reconnect and open Achievements once to make your progress available offline."
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
                        Checking your milestones...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isError) {
        const queryError = adventuresQuery.error ?? collectionsQuery.error;

        const message = queryError instanceof ApiError ? queryError.message : "AdventureLog could not load your achievement progress.";

        return(
            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                <View style={styles.header}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={21} color={colors.textPrimary} />
                    </Pressable>
                </View>

                <View style={styles.centerState}>
                    <Ionicons name="cloud-offline-outline" size={38} color={colors.danger} />

                    <Text style={styles.centerTitle}>
                        Achievements unavailable
                    </Text>

                    <Text style={styles.centerDescription}>
                        {message}
                    </Text>

                    <Pressable
                        disabled={isRefetching}
                        onPress={refreshData}
                        style={({pressed}) => [styles.retryButton, pressed && styles.pressed]}
                    >
                        {isRefetching ? (
                            <ActivityIndicator size="small" color={colors.background} />
                        ): (
                            <Text style={styles.retryText}>
                                Try again
                            </Text>
                        )}
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return(
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={isRefetching}
                        onRefresh={refreshData}
                        tintColor={colors.forest}
                    />
                }
                contentContainerStyle={styles.content}
            >
                <View style={styles.header}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                        onPress={() => router.back()}
                        style={({pressed}) => [styles.backButton, pressed && styles.pressed]}
                    >
                        <Ionicons name="arrow-back" size={21} color={colors.textPrimary} />
                    </Pressable>
                </View>

                <Text style={styles.eyebrow}>
                    Your milestones
                </Text>

                <Text style={styles.title}>
                    Achievements
                </Text>

                <Text style={styles.description}>
                    Small markers of the places, stories, and memories you have collected.
                </Text>

                <View style={styles.summaryCard}>
                    <View style={styles.summaryIcon}>
                        <Ionicons name="ribbon-outline" size={27} color={colors.clay} />
                    </View>

                    <View style={styles.summaryContent}>
                        <Text style={styles.summaryValue}>
                            {earnedAchievements.length} of {achievements.length}
                        </Text>

                        <Text style={styles.summaryLabel}>
                            achievements earned
                        </Text>
                    </View>
                </View>

                {earnedAchievements.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionEyebrow}>
                            Completed
                        </Text>

                        <Text style={styles.sectionTitle}>
                            Earned badges
                        </Text>

                        <View style={styles.cardList}>
                            {earnedAchievements.map((achievement) => (
                                <AchievementProgressCard key={achievement.id} achievement={achievement} />
                            ))}
                        </View>
                    </View>
                ): null}

                {lockedAchievements.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionEyebrow}>
                            Keep exploring
                        </Text>

                        <Text style={styles.sectionTitle}>
                            In progress
                        </Text>

                        <View style={styles.cardList}>
                            {lockedAchievements.map((achievement) => (
                                <AchievementProgressCard key={achievement.id} achievement={achievement} />
                            ))}
                        </View>
                    </View>
                ): (
                    <View style={styles.completeState}>
                        <Ionicons name="sparkles-outline" size={27} color={colors.clay} />

                        <Text style={styles.completeTitle}>
                            Every badge earned
                        </Text>

                        <Text style={styles.completeDescription}>
                            You have completed every current AdventureLog achievement.
                        </Text>
                    </View>
                )}
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
        content: {
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xxxl,
        },
        header: {
            minHeight: 64,
            justifyContent: "center",
        },
        backButton: {
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 22,
        },
        eyebrow: {
            color: colors.clay,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 1.1,
            textTransform: "uppercase",
        },
        title: {
            marginTop: 4,
            color: colors.textPrimary,
            fontSize: 31,
            fontWeight: "800",
        },
        description: {
            maxWidth: 340,
            marginTop: spacing.md,
            color: colors.textSecondary,
            fontSize: 15,
            lineHeight: 22,
        },
        summaryCard: {
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
        summaryIcon: {
            width: 54,
            height: 54,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 19,
        },
        summaryContent: {
            flex: 1,
        },
        summaryValue: {
            color: colors.textPrimary,
            fontSize: 22,
            fontWeight: "800",
        },
        summaryLabel: {
            marginTop: 2,
            color: colors.textSecondary,
            fontSize: 13,
            fontWeight: "600",
        },
        section: {
            marginTop: spacing.xxl,
        },
        sectionEyebrow: {
            color: colors.textMuted,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 1,
            textTransform: "uppercase",
        },
        sectionTitle: {
            marginTop: 3,
            color: colors.textPrimary,
            fontSize: 21,
            fontWeight: "800",
        },
        cardList: {
            gap: spacing.md,
            marginTop: spacing.md,
        },
        completeState: {
            alignItems: "center",
            marginTop: spacing.xxl,
            padding: spacing.xl,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 22,
        },
        completeTitle: {
            marginTop: spacing.md,
            color: colors.textPrimary,
            fontSize: 18,
            fontWeight: "800",
        },
        completeDescription: {
            maxWidth: 280,
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: 13,
            lineHeight: 19,
            textAlign: "center",
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
            textAlign: "center",
        },
        retryButton: {
            minHeight: 46,
            alignItems: "center",
            justifyContent: "center",
            marginTop: spacing.lg,
            paddingHorizontal: spacing.xl,
            backgroundColor: colors.forest,
            borderRadius: 999,
        },
        retryText: {
            color: colors.background,
            fontSize: 13,
            fontWeight: "800",
        },
        pressed: {
            opacity: 0.78,
        },
    });
}