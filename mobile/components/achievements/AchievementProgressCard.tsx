import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { AdventureAchievement } from "@/features/achievements/achievementProgress";
import { AppColors, spacing, useAppTheme } from "@/theme";

type AchievementProgressCardProps = {
    achievement: AdventureAchievement;
};

export function AchievementProgressCard({achievement}: AchievementProgressCardProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const progress = achievement.target > 0 ? achievement.current / achievement.target : 0;

    return(
        <View style={[styles.card, !achievement.isEarned && styles.cardLocked]}>
            <View style={[styles.iconContainer, achievement.isEarned ? styles.iconEarned : styles.iconLocked]}>
                <Ionicons name={achievement.icon} size={25} color={achievement.isEarned ? colors.forest : colors.textMuted} />
            </View>

            <View style={styles.content}>
                <View style={styles.headingRow}>
                    <View style={styles.headingContent}>
                        <Text style={styles.title}>
                            {achievement.title}
                        </Text>

                        <Text style={styles.description}>
                            {achievement.description}
                        </Text>
                    </View>

                    <Ionicons name={achievement.isEarned ? "checkmark-circle" : "lock-closed-outline"} size={21} color={achievement.isEarned ? colors.success : colors.textMuted} />
                </View>

                {achievement.isEarned ? (
                    <Text style={styles.earnedText}>
                        Earned {achievement.earnedDate}
                    </Text>
                ): (
                    <>
                        <View style={styles.progressHeading}>
                            <Text style={styles.progressLabel}>
                                Progress
                            </Text>

                            <Text style={styles.progressValue}>
                                {achievement.current} of {achievement.target}
                            </Text>
                        </View>

                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, {width: `${Math.min(progress * 100, 100)}%`}]} />
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        card: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: spacing.md,
            padding: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 22,
        },
        cardLocked: {
            backgroundColor: colors.surfaceMuted
        },
        iconContainer: {
            width: 52,
            height: 52,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 18
        },
        iconEarned: {
            backgroundColor: colors.surfaceMuted
        },
        iconLocked: {
            backgroundColor: colors.surface
        },
        content: {
            flex: 1
        },
        headingRow: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: spacing.sm,
        },
        headingContent: {
            flex: 1,
        },
        title: {
            color: colors.textPrimary,
            fontSize: 17,
            fontWeight: "800"
        },
        description: {
            marginTop: 4,
            color: colors.textSecondary,
            fontSize: 13,
            lineHeight: 18
        },
        earnedText: {
            marginTop: spacing.md,
            color: colors.success,
            fontSize: 12,
            fontWeight: "800"
        },
        progressHeading: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: spacing.md,
        },
        progressLabel: {
            color: colors.textMuted,
            fontSize: 11,
            fontWeight: "700"
        },
        progressValue: {
            color: colors.textSecondary,
            fontSize: 11,
            fontWeight: "800"
        },
        progressTrack: {
            height: 7,
            overflow: "hidden",
            marginTop: spacing.sm,
            backgroundColor: colors.surface,
            borderRadius: 999
        },
        progressFill: {
            height: "100%",
            backgroundColor: colors.forest,
            borderRadius: 999
        }
    });
}