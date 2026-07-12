import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { AppColors, spacing, useAppTheme } from "@/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type AdventureStatCardProps = {
    label: string;
    value: string;
    icon: IconName;
};

export function AdventureStatCard({label, value, icon}: AdventureStatCardProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    return(
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={18} color={colors.forest} />
            </View>

            <Text style={styles.value}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        card: {
            flex: 1,
            minHeight: 126,
            padding: spacing.md,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 22,
        },
        iconContainer: {
            width: 34,
            height: 34,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.md,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 17,
        },
        value: {
            color: colors.textPrimary,
            fontSize: 25,
            fontWeight: "800",
        },
        label: {
            marginTop: 3,
            color: colors.textSecondary,
            fontSize: 12,
            fontWeight: "600",
        }
    });
}