import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { Adventure } from "@/types/adventure";
import { AppColors, spacing, useAppTheme } from "@/theme";

type MapAdventurePreviewProps = {
    adventure: Adventure;
    onClose: () => void;
    onPress: () => void;
};

const categoryLabels: Record<Adventure["category"], string> = {
    hiking: "Hiking",
    sports: "Sports",
    travel: "Travel",
    food: "Food",
    outdoors: "Outdoors"
};

export function MapAdventurePreview({adventure, onClose, onPress}: MapAdventurePreviewProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const isPlanned = adventure.status === "wishlist";

    return(
        <Pressable 
            accessibilityRole="button"
            accessibilityLabel={`Open ${adventure.title}`}
            onPress={onPress}
            style={({pressed}) => [styles.card, pressed && styles.pressed]}
        >
            <View style={styles.handle} />

            <View style={styles.cardContent}>
                {adventure.photos[0]?.image_url ? (
                    <Image source={{uri: adventure.photos[0].image_url}} style={styles.image} />
                ): (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={28} color={colors.forest} />
                    </View>
                )}
                

                <View style={styles.details}>
                    <View style={styles.topRow}>
                        <View style={styles.previewLabels}>
                            <Text style={styles.category}>
                                {categoryLabels[adventure.category]}
                            </Text>

                            {isPlanned ? (
                                <View style={styles.plannedBadge}>
                                    <Ionicons name="calendar-outline" size={12} color={colors.clay} />

                                    <Text style={styles.plannedText}>
                                        Planned
                                    </Text>
                                </View>
                            ): null}
                        </View>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Close adventure preview"
                            onPress={(event) => {
                                event.stopPropagation();
                                onClose();
                            }}
                            hitSlop={10}
                        >
                            <Ionicons name="close" size={20} color={colors.textMuted} />
                        </Pressable>
                    </View>

                    <Text style={styles.title} numberOfLines={2}>
                        {adventure.title}
                    </Text>

                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={14} color={colors.textMuted} />

                        <Text numberOfLines={1} style={styles.location}>
                            {adventure.location_name}
                        </Text>
                    </View>

                    <Text style={styles.date}>{adventure.adventure_date}</Text>
                </View>
            </View>

            <Pressable
                style={({pressed}) => [styles.openButton, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={`Open ${adventure.title}`}
                onPress={(event) => {
                    event.stopPropagation();
                    onPress();
                }}
            >
                <Text style={styles.openButtonText}>
                    {isPlanned ? "Open plan" : "Open memory"}
                </Text>

                <Ionicons name="arrow-forward" size={17} color={colors.background} />
            </Pressable>
        </Pressable>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        card: {
            // position: "absolute",
            // right: spacing.lg,
            // bottom: spacing.lg,
            // left: spacing.lg,
            // zIndex: 10,
            padding: spacing.md,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 28,
            shadowColor: "#000000",
            shadowOffset: {
                width: 0,
                height: 8
            },
            shadowOpacity: 0.18,
            shadowRadius: 16,
            elevation: 10,
        },
        handle: {
            width: 40,
            height: 4,
            alignSelf: "center",
            marginBottom: spacing.md,
            backgroundColor: colors.border,
            borderRadius: 999,
        },
        cardContent: {
            flexDirection: "row",
            gap: spacing.md,
        },
        image: {
            width: 104,
            height: 112,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 18,
        },
        imagePlaceholder: {
            width: 104,
            height: 112,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 18
        },
        details: {
            flex: 1,
            paddingVertical: 2,
        },
        topRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        category: {
            color: colors.clay,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 0.9,
            textTransform: "uppercase"
        },
        title: {
            marginTop: 6,
            color: colors.textPrimary,
            fontSize: 19,
            fontWeight: "800",
            lineHeight: 23,
        },
        locationRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 3,
            marginTop: spacing.sm,
        },
        location: {
            flex: 1,
            color: colors.textSecondary,
            fontSize: 12,
            fontWeight: "600",
        },
        date: {
            marginTop: 5,
            color: colors.textMuted,
            fontSize: 12,
        },
        openButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            minHeight: 48,
            marginTop: spacing.md,
            backgroundColor: colors.forest,
            borderRadius: 17,
        },
        openButtonText: {
            color: colors.background,
            fontSize: 14,
            fontWeight: "800"
        },
        previewLabels: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
        },
        plannedBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: 3,
            paddingHorizontal: spacing.sm,
            paddingVertical: 3,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 999
        },
        plannedText: {
            color: colors.clay,
            fontSize: 10,
            fontWeight: "800"
        },
        pressed: {
            opacity: 0.85,
        }
    });
}
