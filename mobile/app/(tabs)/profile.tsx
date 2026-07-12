// import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";

// export default function ProfileScreen() {
//     return (
//         <ScreenPlaceholder 
//             eyebrow="Your Trail"
//             title="See how far you've gone."
//             description="Track collections, achievements, favorite places, and personal adventure statistics."
//         />
//     );
// }


// Temp code so I can test the dark vs light mode styles. Will later be replaced with settings toggle
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppearancePreference, AppColors, spacing, useAppTheme } from "@/theme";

const options: Array<{label: string; value: AppearancePreference;}> = [
    {label: "System", value: "system"},
    {label: "Light", value: "light"},
    {label: "Dark", value: "dark"},
];

export default function ProfileScreen() {
    const {
        colors,
        preference,
        resolvedAppearance,
        setPreference,
    } = useAppTheme();

    const styles = createStyles(colors);

    return(
        <View style={styles.container}>
            <Text style={styles.eyebrow}>Appearance Test</Text>

            <Text style={styles.title}>
                Choose your trail light.
            </Text>

            <Text style={styles.description}>
                Current mode: {resolvedAppearance}
            </Text>

            <View style={styles.options}>
                {options.map((option) => {
                    const isSelected = preference === option.value;

                    return(
                        <Pressable
                            key={option.value}
                            onPress={() => void setPreference(option.value)}
                            style={[styles.option, isSelected && styles.optionSelected]}
                        >
                            <Text
                                style={[styles.optionText, isSelected && styles.optionTextSelected]}
                            >
                                {option.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    )
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: spacing.xl,
        backgroundColor: colors.background,
      },
      eyebrow: {
        marginBottom: spacing.sm,
        color: colors.clay,
        fontSize: 13,
        fontWeight: "700",
        letterSpacing: 1.5,
        textTransform: "uppercase",
      },
      title: {
        color: colors.textPrimary,
        fontSize: 34,
        fontWeight: "800",
      },
      description: {
        marginTop: spacing.md,
        color: colors.textSecondary,
        fontSize: 16,
      },
      options: {
        gap: spacing.md,
        marginTop: spacing.xl,
      },
      option: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
      },
      optionSelected: {
        backgroundColor: colors.forest,
        borderColor: colors.forest,
      },
      optionText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: "700",
      },
      optionTextSelected: {
        color: colors.background,
      },
  
    });
  
  }