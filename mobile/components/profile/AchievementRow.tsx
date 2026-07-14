import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { AdventureAchievement } from "@/data/profile";
import { AppColors, spacing, useAppTheme } from "@/theme";

type AchievementRowProps = {
    achievement: AdventureAchievement;
    isLast?: boolean;
};

export function AchievementRow({achievement, isLast = false}: AchievementRowProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    return(
        <View style={[styles.row, !isLast && styles.border]}>
            <View style={styles.iconContainer}>
                <Ionicons name={achievement.icon} size={21} color={colors.forest} />
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>
                    {achievement.title}
                </Text>

                <Text style={styles.description}>
                    {achievement.description}
                </Text>
            </View>

            <Text style={styles.date}>
                {achievement.earnedDate}
            </Text>
        </View>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        row: {
            minHeight: 78,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            paddingVertical: spacing.md,
        },
        border: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
        },
        iconContainer: {
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 16,
        },
        content: {
            flex: 1,
        },
        title: {
            color: colors.textPrimary,
            fontSize: 15,
            fontWeight: "800"
        },
        description: {
            marginTop: 3,
            color: colors.textSecondary,
            fontSize: 12,
            lineHeight: 17,
        },
        date: {
            color: colors.textMuted,
            fontSize: 11,
            fontWeight: "700"
        }
    });
}