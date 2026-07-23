import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppColors, spacing, useAppTheme } from "@/theme";

type OfflineDataStateProps = {
    title?: string;
    description?: string;
    compact?: boolean;
    onBack?: () => void;
};

export function OfflineDataState({
    title = "Not saved on this device",
    description = "Reconnect once to download this information for offline use.",
    compact = false,
    onBack
}: OfflineDataStateProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    return(
        <View style={[styles.container, compact ? styles.containerCompact : styles.containerFull]}>
            <View style={styles.iconContainer}>
                <Ionicons name="cloud-offline-outline" size={30} color={colors.clay} />
            </View>

            <Text style={styles.title}>
                {title}
            </Text>

            <Text style={styles.description}>
                {description}
            </Text>

            {onBack ? (
                <Pressable
                    accessibilityRole="button"
                    onPress={onBack}
                    style={({pressed}) => [styles.backButton, pressed && styles.pressed]}
                >
                    <Text style={styles.backButtonText}>
                        Go back
                    </Text>
                </Pressable>
            ): null}
        </View>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        container: {
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: spacing.xl,
        },
        containerFull: {
            flex: 1,
            paddingVertical: spacing.xxxl,
        },
        containerCompact: {
            minHeight: 180,
            paddingVertical: spacing.xl,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 22,
        },
        iconContainer: {
            width: 64,
            height: 64,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 23,
        },
        title: {
            marginTop: spacing.lg,
            color: colors.textPrimary,
            fontSize: 19,
            fontWeight: "800",
            textAlign: "center"
        },
        description: {
            maxWidth: 300,
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: 14,
            lineHeight: 21,
            textAlign: "center"
        },
        backButton: {
            minHeight: 44,
            alignItems: "center",
            justifyContent: "center",
            marginTop: spacing.lg,
            paddingHorizontal: spacing.xl,
            backgroundColor: colors.forest,
            borderRadius: 999
        },
        backButtonText: {
            color: colors.background,
            fontSize: 13,
            fontWeight: "800"
        },
        pressed: {
            opacity: 0.78
        }
    });
}