import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { RecentAdventure } from "@/data/home";
import { AppColors, spacing, useAppTheme } from "@/theme";

type RecentAdventureCardProps = {
    adventure: RecentAdventure;
};

const categoryLabels: Record<RecentAdventure["category"], string> = {hiking: "Hiking", sports: "Sports", travel: "Travel", food: "Food", outdoors: "Outdoors"};

export function RecentAdventureCard({adventure}: RecentAdventureCardProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    return(
        <Pressable
            accessibilityRole="button"
            style={({pressed}) => [
                styles.card, pressed && styles.pressed,
            ]}
        >
            <Image source={{uri: adventure.imageUrl}} style={styles.image} />

            <View style={styles.content}>
                <View style={styles.categoryRow}>
                    <Text style={styles.category}>
                        {categoryLabels[adventure.category]}
                    </Text>
                    <Text style={styles.date}>{adventure.date}</Text>
                </View>

                <Text numberOfLines={2} style={styles.title}>
                    {adventure.title}
                </Text>

                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                    <Text numberOfLines={1} style={styles.location}>{adventure.location}</Text>
                </View>
            </View>
        </Pressable>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        card: {
            width: 230,
            overflow: "hidden",
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 22,
        },
        pressed: {
            opacity: 0.9,
        },
        image: {
            width: "100%",
            height: 145,
            backgroundColor: colors.surfaceMuted,
        },
        content: {
            padding: spacing.md,
        },
        categoryRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            gap: spacing.sm,
        },
        category: {
            color: colors.clay,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 0.8,
            textTransform: "uppercase",
        },
        date: {
            color: colors.textMuted,
            fontSize: 11,
            fontWeight: "600",
        },
        title: {
            minHeight: 45,
            marginTop: spacing.sm,
            color: colors.textPrimary,
            fontSize: 17,
            fontWeight: "800",
            lineHeight: 22,
        },
        locationRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginTop: spacing.sm,
        },
        location: {
            flex: 1,
            color: colors.textSecondary,
            fontSize: 12,
        }
    });
}