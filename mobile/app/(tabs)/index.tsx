import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AdventureStatCard } from "@/components/home/AdventureStatCard";
import { CollectionProgressCard } from "@/components/home/CollectionProgressCard";
import { FeaturedAdventureCard } from "@/components/home/FeaturedAdventureCard";
import { RecentAdventureCard } from "@/components/home/RecentAdventureCard";
import { activeCollection, featuredAdventure, homeStats, recentAdventures } from "@/data/home";
import { AppColors, spacing, useAppTheme } from "@/theme";

export default function HomeScreen() {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.eyebrow}>Sunday July 12</Text>
                        <Text style={styles.greeting}>Ready to wander?</Text>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Open notifications"
                        style={({pressed}) => [
                            styles.notifcationButton, pressed && styles.pressed,
                        ]}
                    >
                        <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />

                        <View style={styles.notifcationDot} />
                    </Pressable>
                </View>

                <FeaturedAdventureCard {...featuredAdventure} />

                <View style={styles.section}>
                    <View style={styles.sectionHeading}>
                        <View>
                            <Text style={styles.sectionEyebrow}>Your year</Text>
                            <Text style={styles.sectionTitle}>The trail so far</Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        {homeStats.map((stat) => (
                            <AdventureStatCard key={stat.id} {...stat} />
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeading}>
                        <View>
                            <Text style={styles.sectionEyebrow}>In progress</Text>
                            <Text style={styles.sectionTitle}>Keep exploring</Text>
                        </View>

                        <Pressable>
                            <Text style={styles.linkText}>View all</Text>
                        </Pressable>
                    </View>

                    <CollectionProgressCard {...activeCollection} />
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeading}>
                        <View>
                            <Text style={styles.sectionEyebrow}>Memories</Text>
                            <Text style={styles.sectionTitle}>Recent adventures</Text>
                        </View>

                        <Pressable>
                            <Text style={styles.linkText}>Journal</Text>
                        </Pressable>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.recentList}
                    >
                        {recentAdventures.map((adventure) => (
                            <RecentAdventureCard key={adventure.id} adventure={adventure} />
                        ))}
                    </ScrollView>
                </View>

                <Pressable
                    style={({pressed}) => [
                        styles.promptCard, pressed && styles.pressed
                    ]}
                >
                    <View style={styles.promptIcon}>
                        <Ionicons
                            name="sparkles-outline"
                            size={23}
                            color={colors.forest}
                        />
                    </View>

                    <View style={styles.promptContent}>
                        <Text style={styles.promptEyebrow}>Weekend inspiration</Text>
                        <Text style={styles.promptTitle}>Find somewhere new nearby</Text>
                    </View>

                    <Ionicons
                        name="arrow-forward"
                        size={20}
                        color={colors.forest}
                    />
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scrollContent: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.xxxl,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: spacing.xl
        },
        eyebrow: {
            color: colors.clay,
            fontSize: 12,
            fontWeight: "800",
            letterSpacing: 1.2,
            textTransform: "uppercase",
        },
        greeting: {
            marginTop: 5,
            color: colors.textPrimary,
            fontSize: 28, 
            fontWeight: "800",
        },
        notifcationButton: {
            position: "relative",
            width: 46,
            height: 46,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 23,
        },
        notifcationDot: {
            position: "absolute",
            top: 11,
            right: 11,
            width: 7,
            height: 7,
            backgroundColor: colors.clay,
            borderRadius: 4,
        },
        pressed: {
            opacity: 0.88
        },
        section: {
            marginTop: spacing.xxl
        },
        sectionHeading: {
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: spacing.md,
        },
        sectionEyebrow: {
            color: colors.textMuted,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 1.2,
            textTransform: "uppercase"
        },
        sectionTitle: {
            marginTop: 3,
            color: colors.textPrimary,
            fontSize: 22,
            fontWeight: "800"
        },
        linkText: {
            color: colors.forest,
            fontSize: 13,
            fontWeight: "800",
        },
        statsRow: {
            flexDirection: "row",
            gap: spacing.sm,
        },
        recentList: {
            gap: spacing.md,
            paddingRight: spacing.lg,
        },
        promptCard: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            marginTop: spacing.xxl,
            padding: spacing.lg,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 24,
        },
        promptIcon: {
            width: 46,
            height: 46,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surface,
            borderRadius: 18,
        },
        promptContent: {
            flex: 1,
        },
        promptEyebrow: {
            color: colors.textMuted,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 0.8,
            textTransform: "uppercase"
        },
        promptTitle: {
            marginTop: 3,
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: "800",
        }
    });
}