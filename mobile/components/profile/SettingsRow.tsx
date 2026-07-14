import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppColors, spacing, useAppTheme } from "@/theme";

type SettingsRowProps = {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    title: string;
    description?: string;
    onPress?: () => void;
    isLast?: boolean;
    destructive?: boolean;
};

export function SettingsRow({icon, title, description, onPress, isLast = false, destructive = false}: SettingsRowProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const actionColor = destructive ? colors.danger : colors.textPrimary;

    return(
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            style={({pressed}) => [styles.row, !isLast && styles.border, pressed && styles.pressed]}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={20} color={destructive ? colors.danger : colors.forest} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, {color: actionColor}]}>
                    {title}
                </Text>

                {description ? (
                    <Text style={styles.description}>
                        {description}
                    </Text>
                ): null}
            </View>

            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        row: {
            minHeight: 74,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            paddingVertical: spacing.md,
        },
        border: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
        },
        pressed: {
            opacity: 0.76,
        },
        iconContainer: {
            width: 42,
            height: 42,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 15,
        },
        content: {
            flex: 1,
        },
        title: {
            fontSize: 14,
            fontWeight: "800"
        },
        description: {
            marginTop: 3,
            color: colors.textSecondary,
            fontSize: 12,
            lineHeight: 17
        }
    });
}