import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppColors, spacing, useAppTheme } from "@/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type CollectionProgressCardProps = {
    title: string;
    description: string;
    completed: number;
    total: number;
    icon: IconName;
    onPress: () => void;
};

export function CollectionProgressCard({title, description, completed, total, icon, onPress}: CollectionProgressCardProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);
    const progress = total > 0 ? Math.min(completed / total, 1) : 0;

    return (
        <Pressable
            accessibilityRole="button"
            style={({pressed}) => [
                styles.card, pressed && styles.pressed
            ]}
            accessibilityLabel={`Open collection ${title}`}
            onPress={onPress}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={24} color={colors.clay} />
            </View>

            <View style={styles.content}>
                <View style={styles.headingRow}>
                    <View style={styles.headingText}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.description}>{description}</Text>
                    </View>

                    <Ionicons name="chevron-forward" size={19} color={colors.textMuted} />
                </View>

                <View style={styles.progressTrack}>
                    <View 
                        style={[styles.progressFill, {width: `${progress * 100}%`}]}
                    />
                </View>

                <Text style={styles.progressText}>
                    {completed} of {total} completed
                </Text>
            </View>
        </Pressable>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        card: {
            flexDirection: "row",
            gap: spacing.md,
            padding: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 24,
        },
        pressed: {
            opacity: 0.9
        },
        iconContainer: {
            width: 50,
            height: 50,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 18,
        },
        content: {
            flex: 1,
        },
        headingRow: {
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
        },
        headingText: {
            flex: 1,
            paddingRight: spacing.sm,
        },
        title: {
            color: colors.textPrimary,
            fontSize: 17,
            fontWeight: "800",
        },
        description: {
            marginTop: 4,
            color: colors.textSecondary,
            fontSize: 13,
            lineHeight: 18,
        },
        progressTrack: {
            height: 7,
            overflow: "hidden",
            marginTop: spacing.lg,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 999,
        },
        progressFill: {
            height: "100%",
            backgroundColor: colors.clay,
            borderRadius: 999,
        },
        progressText: {
            marginTop: spacing.sm,
            color: colors.textMuted,
            fontSize: 12,
            fontWeight: "600",
        }
    });
}