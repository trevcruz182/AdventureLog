import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { JournalAdventure } from "@/data/journal";
import { AppColors, spacing, useAppTheme } from "@/theme";

type JournalAdventureCardProps = {
    adventure: JournalAdventure;
};

const categoryLabels: Record<JournalAdventure["category"], string> = {hiking: "Hiking", sports: "Sports", travel: "Travel", food: "Food", outdoors: "Outdoors"}

const categoryIcons: Record<JournalAdventure["category"], React.ComponentProps<typeof Ionicons>["name"]> = {
    hiking: "trail-sign-outline",
    sports: "trophy-outline",
    travel: "airplane-outline",
    food: "restaurant-outline",
    outdoors: "leaf-outline"
};

export function JournalAdventureCard({adventure}: JournalAdventureCardProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    return(
        <Pressable
            accessibilityRole="button"
            style={({pressed}) => [
                styles.card, pressed && styles.cardPressed
            ]}
        >
            <View style={styles.imageWrapper}>
                <Image source={{uri: adventure.imageUrl}} style={styles.image} />

                <View style={styles.dateBadge}>
                    <Text style={styles.dateText}>{adventure.date}</Text>
                </View>

                {adventure.isFavorite ? (
                    <View style={styles.favoriteBadge}>
                        <Ionicons name="heart" size={15} color="#FFFFFF" />
                    </View>
                ): null}
            </View>

            <View style={styles.content}>
                <View style={styles.categoryRow}>
                    <View style={styles.category}>
                        <Ionicons name={categoryIcons[adventure.category]} size={14} color={colors.clay} />

                        <Text style={styles.categoryText}>
                            {categoryLabels[adventure.category]}
                        </Text>
                    </View>

                    <View style={styles.rating}>
                        <Ionicons name="star" size={14} color={colors.warning} />

                        <Text style={styles.ratingText}>
                            {adventure.rating}
                        </Text>
                    </View>
                </View>

                <Text style={styles.title}>{adventure.title}</Text>

                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textMuted} />

                    <Text numberOfLines={1} style={styles.location}>
                        {adventure.location}
                    </Text>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                    {adventure.description}
                </Text>

                <View style={styles.footer}>
                    <Text style={styles.viewText}>
                        View memory
                    </Text>

                    <Ionicons name="arrow-forward" size={17} color={colors.forest} />
                </View>
            </View>
        </Pressable>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        card: {
            overflow: "hidden",
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 26,
        },
        cardPressed: {
            opacity: 0.93,
            transform: [{scale: 0.997}]
        },
        imageWrapper: {
            position: "relative"
        },
        image: {
            width: "100%",
            height: 210,
            backgroundColor: colors.surfaceMuted
        },
        dateBadge: {
            position: "absolute",
            left: spacing.md,
            bottom: spacing.md,
            paddingHorizontal: 11,
            paddingVertical: 7,
            backgroundColor: "rgba(17, 23, 19, 0.66)",
            borderRadius: 999,
        },
        dateText: {
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: "800",
        },
        favoriteBadge: {
            position: "absolute",
            top: spacing.md,
            right: spacing.md,
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(17, 23, 19, 0.62)",
            borderRadius: 18,
        },
        content: {
            padding: spacing.lg,
        },
        categoryRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
        },
        category: {
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
        },
        categoryText: {
            color: colors.clay,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 0.9,
            textTransform: "uppercase"
        },
        rating: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
        },
        ratingText: {
            color: colors.textSecondary,
            fontSize: 12,
            fontWeight: "700",
        },
        title: {
            marginTop: spacing.sm,
            color: colors.textPrimary,
            fontSize: 22,
            fontWeight: "800",
            lineHeight: 27,
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
            fontSize: 13,
            fontWeight: "600",
        },
        description: {
            marginTop: spacing.md,
            color: colors.textSecondary,
            fontSize: 14,
            lineHeight: 21,
        },
        footer: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
            marginTop: spacing.lg
        },
        viewText: {
            color: colors.forest,
            fontSize: 13,
            fontWeight: "800",
        }
    });
}