import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppearancePreference, AppColors, spacing, useAppTheme } from "@/theme";

const appearanceOptions: {
    label: string;
    value: AppearancePreference;
    icon: React.ComponentProps<typeof Ionicons>["name"]
}[] = [
    {
        label: "System",
        value: "system",
        icon: "phone-portrait-outline"
    },
    {
        label: "Light",
        value: "light",
        icon: "sunny-outline"
    },
    {
        label: "Dark",
        value: "dark",
        icon: "moon-outline"
    },
];

export function AppearanceSelector() {
    const {colors, preference, setPreference} = useAppTheme();

    const styles = createStyles(colors);

    return(
        <View style={styles.container}>
            {appearanceOptions.map((option) => {
                const isSelected = preference === option.value;

                return(
                    <Pressable
                        key={option.value}
                        accessibilityRole="button"
                        accessibilityState={{selected: isSelected}}
                        onPress={() => void setPreference(option.value)}
                        style={({pressed}) => [styles.option, isSelected && styles.optionSelected, pressed && styles.pressed]}
                    >
                        <Ionicons name={option.icon} size={19} color={isSelected ? colors.background : colors.textSecondary} />

                        <Text style={[styles.label, isSelected && styles.labelSelected]}>
                            {option.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        container: {
            flexDirection: "row",
            gap: spacing.sm,
            padding: spacing.xs,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 20,
        },
        option: {
            flex: 1,
            minHeight: 52,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            borderRadius: 16
        },
        optionSelected: {
            backgroundColor: colors.forest,
        },
        label: {
            color: colors.textSecondary,
            fontSize: 13,
            fontWeight: "700"
        },
        labelSelected: {
            color: colors.background
        },
        pressed: {
            opacity: 0.82
        }
    });
}