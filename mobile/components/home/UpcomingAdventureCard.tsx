import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { Adventure } from "@/types/adventure";
import { AppColors, useAppTheme, spacing } from "@/theme";

type UpcomingAdventureCardProps = {
    adventure: Adventure;
    onPress: () => void;
};

const categoryLabels: Record<Adventure["category"], string> = {
    hiking: "Hiking",
    sports: "Sports",
    travel: "Travel",
    food: "Food",
    outdoors: "Outdoors",
};

const categoryIcons: Record<Adventure["category"], React.ComponentProps<typeof Ionicons>["name"]> = {
    hiking: "trail-sign-outline",
    sports: "trophy-outline",
    travel: "airplane-outline",
    food: "restaurant-outline",
    outdoors: "leaf-outline"
};

function parseLocalDate(value: string): Date {
    const [year, month, day] = value.split("-").map(Number);

    return new Date(year, month-1, day);
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
    }).format(parseLocalDate(value));
}

function getRelativeDateLabel(value: string): string {
    const adventureDate = parseLocalDate(value);

    adventureDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    const daysUntil = Math.round((adventureDate.getTime() - today.getTime()) / millisecondsPerDay);

    if(daysUntil === 0) {
        return "Today";
    }

    if(daysUntil === 1) {
        return "Tomorrow";
    }

    return `In ${daysUntil} days`;
}

export function UpcomingAdventureCard({adventure, onPress}: UpcomingAdventureCardProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const coverImage = adventure.photos[0]?.image_url;

    return(
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open planned adventure ${adventure.title}`}
            onPress={onPress}
            style={({pressed}) => [styles.card, pressed && styles.pressed]}
        >
            {coverImage ? (
                <Image source={{uri: coverImage}} style={styles.image} />
            ): (
                <View style={styles.imagePlaceholder}>
                    <Ionicons name={categoryIcons[adventure.category]} size={30} color={colors.forest} />
                </View>
            )}

            <View style={styles.content}>
                <View style={styles.topRow}>
                    <View style={styles.category}>
                        <Ionicons name={categoryIcons[adventure.category]} size={14} color={colors.clay} />

                        <Text style={styles.categoryText}>
                            {categoryLabels[adventure.category]}
                        </Text>
                    </View>

                    <View style={styles.dateBadge}>
                        <Text style={styles.dateBadgeText}>
                            {getRelativeDateLabel(adventure.adventure_date)}
                        </Text>
                    </View>
                </View>

                <Text style={styles.title} numberOfLines={2}>
                    {adventure.title}
                </Text>

                <View style={styles.metadataRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />

                    <Text style={styles.metadata}>
                        {formatDate(adventure.adventure_date)}
                    </Text>
                </View>

                <View style={styles.metadataRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textMuted} />

                    <Text style={styles.metadata} numberOfLines={1}>
                        {adventure.location_name}
                    </Text>
                </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color={colors.forest} />
        </Pressable>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        card: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            padding: spacing.md,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 24
        },
        image: {
            width: 94,
            height: 112,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 18
        },
        imagePlaceholder: {
            width: 94,
            height: 112,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 18
        },
        content: {
            flex: 1,
        },
        topRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.sm,
        },
        category: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
        },
        categoryText: {
            color: colors.clay,
            fontSize: 10,
            fontWeight: "800",
            letterSpacing: 0.7,
            textTransform: "uppercase"
        },
        dateBadge: {
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 999
        },
        dateBadgeText: {
            color: colors.forest,
            fontSize: 10,
            fontWeight: "800"
        },
        title: {
            marginTop: spacing.sm,
            color: colors.textPrimary,
            fontSize: 17,
            fontWeight: "800",
            lineHeight: 21,
        },
        metadataRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
            marginTop: spacing.xs,
        },
        metadata: {
            flex: 1,
            color: colors.textSecondary,
            fontSize: 11,
            fontWeight: "600"
        },
        pressed: {
            opacity: 0.85,
            transform: [{scale: 0.995}]
        }
    });
}