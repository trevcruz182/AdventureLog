import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { Adventure } from "@/types/adventure";
import { AppColors, spacing, useAppTheme } from "@/theme";

type JournalAdventureCardProps = {
    adventure: Adventure;
    onPress: () => void;
};

const categoryLabels: Record<Adventure["category"], string> = {hiking: "Hiking", sports: "Sports", travel: "Travel", food: "Food", outdoors: "Outdoors"}

const categoryIcons: Record<Adventure["category"], React.ComponentProps<typeof Ionicons>["name"]> = {
    hiking: "trail-sign-outline",
    sports: "trophy-outline",
    travel: "airplane-outline",
    food: "restaurant-outline",
    outdoors: "leaf-outline"
};

function formatAdventureDate(value: string): string {
    const [year, month, day] = value.split("-").map(Number);

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric"
    }).format(new Date(year, month-1, day));
}

export function JournalAdventureCard({adventure, onPress}: JournalAdventureCardProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const formattedDate = formatAdventureDate(adventure.adventure_date);

    const isPlanned = adventure.status === "wishlist";

    return(
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${adventure.title}`}
            onPress={onPress}
            style={({pressed}) => [
                styles.card, pressed && styles.cardPressed
            ]}
        >
            <View style={styles.imageWrapper}>
                {adventure.photos[0]?.image_url ? (
                    <Image 
                        source={{uri: adventure.photos[0].image_url}}
                        style={styles.image}
                    />
                ): (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name={categoryIcons[adventure.category]} size={38} color={colors.forest} />

                        <Text style={styles.imagePlaceholderText}>
                            {categoryLabels[adventure.category]}
                        </Text>
                    </View>
                )}

                <View style={styles.dateBadge}>
                    <Text style={styles.dateText}>{formattedDate}</Text>
                </View>

                {adventure.is_favorite ? (
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

                    {isPlanned ? (
                        <View style={styles.plannedBadge}>
                            <Ionicons name="calendar-outline" size={14} color={colors.clay} />

                            <Text style={styles.plannedText}>
                                Planned
                            </Text>
                        </View>
                    ): (
                        <View style={styles.rating}>
                            <Ionicons name="star" size={14} color={colors.warning} />

                            <Text style={styles.ratingText}>
                                {adventure.rating}
                            </Text>
                        </View>
                    )}
                </View>

                <Text style={styles.title}>{adventure.title}</Text>

                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textMuted} />

                    <Text numberOfLines={1} style={styles.location}>
                        {adventure.location_name}
                    </Text>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                    {adventure.description}
                </Text>

                <View style={styles.footer}>
                    <Text style={styles.viewText}>
                        {isPlanned ? "View plan" : "View memory"}
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
            opacity: 0.88,
            transform: [{scale: 0.99}]
        },
        imageWrapper: {
            position: "relative"
        },
        image: {
            width: "100%",
            height: 210,
            backgroundColor: colors.surfaceMuted
        },
        imagePlaceholder: {
            width: "100%",
            height: 210,
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            backgroundColor: colors.surfaceMuted
        },
        imagePlaceholderText: {
            color: colors.textSecondary,
            fontSize: 13,
            fontWeight: "800"
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
        },
        plannedBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 999
        },
        plannedText: {
            color: colors.clay,
            fontSize: 11,
            fontWeight: "800"
        }
    });
}