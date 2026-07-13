import { StyleSheet, Text, View } from "react-native";

import { AppColors, spacing, useAppTheme } from "@/theme";

type AdventureStepIndicatorProps = {
    currentStep: number;
    totalSteps: number;
};

export function AdventureStepIndicator({currentStep, totalSteps}: AdventureStepIndicatorProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    return(
        <View style={styles.container}>
            <View style={styles.labels}>
                <Text style={styles.stepText}>
                    Step {currentStep} of {totalSteps}
                </Text>

                <Text style={styles.percentText}>
                    {Math.round((currentStep / totalSteps) * 100)}%
                </Text>
            </View>

            <View style={styles.track}>
                <View style={[styles.fill, {width: `${(currentStep / totalSteps) * 100}%`}]} />
            </View>
        </View>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        container: {
            marginTop: spacing.lg,
            marginHorizontal: spacing.lg,
        },
        labels: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: spacing.sm,
        },
        stepText: {
            color: colors.textSecondary,
            fontSize: 12,
            fontWeight: "700"
        },
        percentText: {
            color: colors.forest,
            fontSize: 12,
            fontWeight: "800"
        },
        track: {
            height: 6,
            overflow: "hidden",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 999,
        },
        fill: {
            height: "100%",
            backgroundColor: colors.clay,
            borderRadius: 999,
        }
    });
}