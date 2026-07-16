import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AppColors, spacing, useAppTheme } from "@/theme";

export function SessionLoadingScreen() {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    return(
        <View style={styles.container}>
            <View style={styles.mark}>
                <Text style={styles.markText}>A</Text>
            </View>

            <ActivityIndicator size="small" color={colors.forest} style={styles.indicator} />

            <Text style={styles.text}>
                Finding your trail...
            </Text>
        </View>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        container: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.background,
        },
        mark: {
            width: 64,
            height: 64,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.forest,
            borderRadius: 24,
        },
        markText: {
            color: colors.background,
            fontSize: 29,
            fontWeight: "900"
        },
        indicator: {
            marginTop: spacing.xl,
        },
        text: {
            marginTop: spacing.md,
            color: colors.textSecondary,
            fontSize: 14,
            fontWeight: "700"
        }
    });
}