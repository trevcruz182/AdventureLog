import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { AdventureCollection } from "@/types/collection";
import { AppColors, spacing, useAppTheme } from "@/theme";

type ProfileCollectionCardProps = {
    collection: AdventureCollection;
    onPress: () => void;
};

export function ProfileCollectionCard({collection, onPress}: ProfileCollectionCardProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const progress = Math.min(collection.adventure_count / collection.target_count, 1);

    return(
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${collection.title}`}
            onPress={onPress}
            style={({pressed}) => [styles.card, pressed && styles.pressed]}
        >
            <View style={styles.topRow}>
                <View style={styles.iconContainer}>
                    <Ionicons name={collection.icon} size={23} color={colors.clay} />
                </View>

                <Ionicons name="chevron-forward" size={19} color={colors.textMuted} />
            </View>

            <Text style={styles.title}>
                {collection.title}
            </Text>

            <Text style={styles.description} numberOfLines={2}>
                {collection.description}
            </Text>

            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, {width: `${progress * 100}%`}]} />
            </View>

            <Text style={styles.progressText}>
                {collection.adventure_count} of{" "}
                {collection.target_count}
            </Text>
        </Pressable>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        card: {
            width: 230,
            padding: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 24,
        },
        pressed: {
            opacity: 0.86,
        },
        topRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
        },
        iconContainer: {
            width: 46,
            height: 46,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 17,
        },
        title: {
            marginTop: spacing.lg,
            color: colors.textPrimary,
            fontSize: 18,
            fontWeight: "800"
        },
        description: {
            minHeight: 42,
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: 13,
            lineHeight: 19,
        },
        progressTrack: {
            height: 7,
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
        progressText: {
            marginTop: spacing.sm,
            color: colors.textMuted,
            fontSize: 12,
            fontWeight: "700"
        }
    });
}