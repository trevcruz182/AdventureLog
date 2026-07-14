import { StyleSheet, Text, View } from "react-native";

import { ProfileStat } from "@/data/profile";
import { AppColors, spacing, useAppTheme } from "@/theme";

type ProfileStatsProps = {
    stats: ProfileStat[];
};

export function ProfileStats({stats}: ProfileStatsProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    return(
        <View style={styles.container}>
            {stats.map((stat, index) => (
                <View
                    key={stat.id}
                    style={[styles.stat, index < stats.length - 1 && styles.statBorder]}
                >
                    <Text style={styles.value}>
                        {stat.value}
                    </Text>

                    <Text style={styles.label}>
                        {stat.label}
                    </Text>
                </View>
            ))}
        </View>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        container: {
            flexDirection: "row",
            paddingVertical: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 24,
        },
        stat: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center"
        },
        statBorder: {
            borderRightWidth: StyleSheet.hairlineWidth,
            borderRightColor: colors.border,
        },
        value: {
            color: colors.textPrimary,
            fontSize: 24,
            fontWeight: "800"
        },
        label: {
            marginTop: 4,
            color: colors.textSecondary,
            fontSize: 12,
            fontWeight: "700"
        }
    });
}