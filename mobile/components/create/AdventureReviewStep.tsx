import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { CreateAdventureFormValues } from "@/features/adventures/createAdventureSchema";
import { AppColors, spacing, useAppTheme } from "@/theme";

type AdventureReviewStepProps = {
    values: CreateAdventureFormValues;
    onChangeRating: (rating: number) => void;
    onToggleFavorite: () => void;
    heading?: string;
    description?: string;
};

const categoryLabels: Record<CreateAdventureFormValues["category"], string> = {
    hiking: "Hiking",
    sports: "Sports",
    travel: "Travel",
    food: "Food",
    outdoors: "Outdoors",
};

export function AdventureReviewStep({values, onChangeRating, onToggleFavorite, heading = "One last look.", description = "Review the memory before adding it to your journal."}: AdventureReviewStepProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const isPlanned = values.status === "wishlist";

    return(
        <View>
            <Text style={styles.heading}>{heading}</Text>

            <Text style={styles.description}>
                {description}
            </Text>

            <View style={styles.card}>
                {values.photos[0] ? (
                    <Image source={{uri: values.photos[0]}} style={styles.coverImage} />
                ): (
                    <View style={styles.coverPlaceholder}>
                        <Ionicons name="image-outline" size={36} color={colors.textMuted} />
                    </View>
                )}

                <View style={styles.cardContent}>
                    <View style={styles.categoryRow}>
                        <Text style={styles.category}>
                            {categoryLabels[values.category]}
                        </Text>

                        <Pressable onPress={onToggleFavorite}>
                            <Ionicons name={values.isFavorite ? "heart" : "heart-outline"} size={23} color={values.isFavorite ? colors.clay : colors.textMuted} />
                        </Pressable>
                    </View>

                    <View style={[styles.statusBadge, isPlanned && styles.statusBadgePlanned]}>
                        <Ionicons name={isPlanned ? "calendar-outline" : "checkmark-circle-outline"} size={14} color={isPlanned ? colors.clay : colors.forest} />

                        <Text style={[styles.statusBadgeText, isPlanned && styles.statusBadgeTextPlanned]}>
                            {isPlanned ? "Planned" : "Completed"}
                        </Text>
                    </View>

                    <Text style={styles.title}>{values.title}</Text>

                    <View style={styles.metadataRow}>
                        <Ionicons name="location-outline" size={15} color={colors.textMuted} />

                        <Text style={styles.metadataText}>
                            {values.locationName}
                        </Text>
                    </View>

                    <View style={styles.metadataRow}>
                        <Ionicons name="calendar-outline" size={15} color={colors.textMuted} />

                        <Text style={styles.metadataText}>
                            {values.date}
                        </Text>
                    </View>

                    {values.description ? (
                        <Text style={styles.memory}>
                            {values.description}
                        </Text>
                    ): null}
                </View>
            </View>

            {!isPlanned ? (
                <View style={styles.ratingSection}>
                    <Text style={styles.ratingLabel}>
                        How would you rate it?
                    </Text>

                    <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <Pressable
                                key={rating}
                                onPress={() => onChangeRating(rating)}
                                hitSlop={5}
                            >
                                <Ionicons name={rating <= values.rating ? "star" : "star-outline"} size={32} color={rating <= values.rating ? colors.warning : colors.textMuted} />
                            </Pressable>
                        ))}
                    </View>
                </View>
            ) : null}

            <View style={styles.summary}>
                <SummaryRow
                    icon={isPlanned ? "calendar-outline" : "checkmark-circle-outline"}
                    label="Status"
                    value={isPlanned ? "Planned" : "Completed"}
                    colors={colors}
                />

                <SummaryRow
                    icon="images-outline"
                    label="Photos"
                    value={`${values.photos.length}`}
                    colors={colors}
                />

                <SummaryRow 
                    icon="heart-outline"
                    label="Favorite"
                    value={values.isFavorite ? "Yes" : "No"}
                    colors={colors}
                />
            </View>
        </View>
    );
}

type SummaryRowProps = {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    label: string;
    value: string;
    colors: AppColors;
};

function SummaryRow({icon, label, value, colors}: SummaryRowProps) {
    const styles = createStyles(colors);

    return(
        <View style={styles.summaryRow}>
            <View style={styles.summaryLabel}>
                <Ionicons name={icon} size={18} color={colors.forest} />

                <Text style={styles.summaryLabelText}>
                    {label}
                </Text>
            </View>

            <Text style={styles.summaryValue}>{value}</Text>
        </View>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        heading: {
            color: colors.textPrimary,
            fontSize: 28,
            fontWeight: "800"
        },
        description: {
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: 15,
            lineHeight: 22,
        },
        card: {
            overflow: "hidden",
            marginTop: spacing.xl,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 26,
        },
        coverImage: {
            width: "100%",
            height: 230,
            backgroundColor: colors.surfaceMuted
        },
        coverPlaceholder: {
            height: 190,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
        },
        cardContent: {
            padding: spacing.lg,
        },
        categoryRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        category: {
            color: colors.clay,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 1,
            textTransform: "uppercase",
        },
        title: {
            marginTop: spacing.sm,
            color: colors.textPrimary,
            fontSize: 23,
            fontWeight: "800",
        },
        metadataRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            marginTop: spacing.sm,
        },
        metadataText: {
            flex: 1,
            color: colors.textSecondary,
            fontSize: 13,
            fontWeight: "600",
        },
        memory: {
            marginTop: spacing.md,
            color: colors.textSecondary,
            fontSize: 14,
            lineHeight: 21,
        },
        ratingSection: {
            alignItems: "center",
            marginTop: spacing.xl,
            padding: spacing.lg,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 22,
        },
        ratingLabel: {
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: "800"
        },
        stars: {
            flexDirection: "row",
            gap: spacing.sm,
            marginTop: spacing.md,
        },
        summary: {
            marginTop: spacing.lg,
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 22,
        },
        summaryRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 54,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
        },
        summaryLabel: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
        },
        summaryLabelText: {
            color: colors.textSecondary,
            fontSize: 13,
            fontWeight: "700"
        },
        summaryValue: {
            color: colors.textPrimary,
            fontSize: 13,
            fontWeight: "800"
        },
        statusBadge: {
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
            marginTop: spacing.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 999
        },
        statusBadgePlanned: {
            backgroundColor: colors.surfaceMuted
        },
        statusBadgeText: {
            color: colors.forest,
            fontSize: 12,
            fontWeight: "800"
        },
        statusBadgeTextPlanned: {
            color: colors.clay
        }
    });
}