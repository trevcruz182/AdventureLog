import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

// import { RecentAdventure } from "@/data/home";
import type { Adventure } from "@/types/adventure";
import { AppColors, spacing, useAppTheme } from "@/theme";

type RecentAdventureCardProps = {
    adventure: Adventure;
    onPress: () => void;
};

const categoryLabels: Record<Adventure["category"], string> = {
    hiking: "Hiking", 
    sports: "Sports", 
    travel: "Travel", 
    food: "Food", 
    outdoors: "Outdoors"
};

function formatAdventureDate(value: string): string {
    const [year, month, day] = value.split("-").map(Number);

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric"
    }).format(new Date(year, month-1, day));
}

export function RecentAdventureCard({adventure, onPress}: RecentAdventureCardProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    return(
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${adventure.title}`}
            onPress={onPress}
            style={({pressed}) => [
                styles.card, pressed && styles.pressed,
            ]}
        >
            {adventure.photos[0]?.image_url ? (
                <Image source={{uri: adventure.photos[0].image_url}} style={styles.image} />
            ): (
                <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={30} color={colors.forest} />
                </View>
            )}
            

            <View style={styles.content}>
                <View style={styles.categoryRow}>
                    <Text style={styles.category}>
                        {categoryLabels[adventure.category]}
                    </Text>
                    <Text style={styles.date}>{adventure.adventure_date}</Text>
                </View>

                <Text numberOfLines={2} style={styles.title}>
                    {adventure.title}
                </Text>

                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                    <Text numberOfLines={1} style={styles.location}>{adventure.location_name}</Text>
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
        imagePlaceholder: {
            width: "100%",
            height: 145,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted
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