import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";

import { spacing } from "@/theme";
import type { Adventure } from "@/types/adventure";

type FeaturedAdventureCardProps = {
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
        month: "long",
        day: "numeric",
        year: "numeric"
    }).format(new Date(year, month-1, day));
}

export function FeaturedAdventureCard({adventure, onPress}: FeaturedAdventureCardProps) {
    const coverImage = adventure.photos[0]?.image_url;
    
    return(
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${adventure.title}`}
            onPress={onPress}
            style={({pressed}) => [styles.card, pressed && styles.cardPressed]}
        >
            <ImageBackground
                source={{uri: coverImage}}
                style={styles.image}
                imageStyle={styles.imageRadius}
            >
                <LinearGradient
                    colors={["rgba(10, 18, 12, 0.05)", "rgba(10, 18, 13, 0.85)"]}
                    style={styles.gradient}
                >
                    <View style={styles.topRow}>
                        <View style={styles.categoryBadge}>
                            <Ionicons name="trail-sign-outline" size={14} color="#FFFFFF" />
                            <Text style={styles.categoryText}>{categoryLabels[adventure.category]}</Text>
                        </View>

                        <View style={styles.favoriteButton}>
                            <Ionicons name={adventure.is_favorite ? "heart" : "heart-outline"} size={20} color="#FFFFFF" />
                        </View>
                    </View>

                    <View>
                        <Text style={styles.eyebrow}>Latest Adventure</Text>
                        <Text style={styles.title}>{adventure.title}</Text>

                        <View style={styles.metadataRow}>
                            <Ionicons name="location-outline" size={15} color="rgba(255, 255, 255, 0.85)" />
                            <Text style={styles.metadata}>{adventure.location_name}</Text>
                        </View>

                        <Text style={styles.date}>{formatAdventureDate(adventure.adventure_date)}</Text>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        height: 360,
        overflow: "hidden",
        borderRadius: 28,
    },
    cardPressed: {
        opacity: 0.94,
        transform: [{scale: 0.995}]
    },
    image: {
        flex: 1,
    },
    imageRadius: {
        borderRadius: 28
    },
    gradient: {
        flex: 1,
        justifyContent: "space-between",
        padding: spacing.lg,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    categoryBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "rgba(17, 23, 19, 0.48)",
    },
    categoryText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700",
    },
    favoriteButton: {
        width: 42,
        height: 42,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(17, 23, 19, 0.42)",
        borderRadius: 21,
    },
    eyebrow: {
        marginBottom: 8,
        color: "rgba(255, 255, 255, 0.78)",
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1.4,
        textTransform: "uppercase",
    },
    title: {
        maxWidth: 285,
        color: "#FFFFFF",
        fontSize: 31,
        fontWeight: "800",
        lineHeight: 35,
    },
    metadataRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 12,
    },
    metadata: {
        color: "rgba(255, 255, 255, 0.88)",
        fontSize: 14,
        fontWeight: "600",
    },
    date: {
        marginTop: 6,
        color: "rgba(255, 255, 255, 0.68)",
        fontSize: 13,
    }
});