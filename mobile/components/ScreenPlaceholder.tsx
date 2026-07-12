import { StyleSheet, Text, View } from "react-native";

import { AppColors, useAppTheme, spacing } from "@/theme";

type ScreenPlaceholderProps = {
    eyebrow: string;
    title: string;
    description: string;
};

export function ScreenPlaceholder({eyebrow, title, description}: ScreenPlaceholderProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);
    
    return(
        <View style={styles.container}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
        </View>
    );
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
            marginBottom: spacing.md,
            color: colors.textPrimary,
            fontSize: 36,
            fontWeight: "800",
        },
        description: {
            maxWidth: 340,
            color: colors.textSecondary,
            fontSize: 17,
            lineHeight: 26,
        }
    });
}