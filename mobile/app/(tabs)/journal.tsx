import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, SectionList, StyleSheet, Text, TextInput, View, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { JournalAdventureCard } from "@/components/journal/JournalAdventureCard";
import { AdventureCategory } from "@/data/home";
import { JournalAdventure, journalAdventures } from "@/data/journal";
import { useAdventures } from "@/features/adventures/useAdventures";
import { ApiError } from "@/lib/api/ApiError";
import type { Adventure } from "@/types/adventure";
import { AppColors, spacing, useAppTheme } from "@/theme";
import { RefreshControl } from "react-native-gesture-handler";

type CategoryFilter = "all" | AdventureCategory;

type JournalSection = {
    title: string;
    data: Adventure[];
}

const categoryFilters: Array<{
    label: string;
    value: CategoryFilter;
    icon: React.ComponentProps<typeof Ionicons>["name"];
}> = [
    {
        label: "All",
        value: "all",
        icon: "apps-outline",
    },
    {
        label: "Hiking",
        value: "hiking",
        icon: "trail-sign-outline",
    },
    {
        label: "Sports",
        value: "sports",
        icon: "trophy-outline",
    },
    {
        label: "Travel",
        value: "travel",
        icon: "airplane-outline",
    },
    {
        label: "Food",
        value: "food",
        icon: "restaurant-outline",
    },
    {
        label: "Outdoors",
        value: "outdoors",
        icon: "leaf-outline",
    },
];

export default function JournalScreen() {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching
    } = useAdventures({limit: 100});

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");

    const sections = useMemo<JournalSection[]>(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        const adventures: Adventure[] = data?.items ?? [];

        const filteredAdventures = adventures.filter((adventure) => {
            const matchesCategory = selectedCategory === "all" || adventure.category === selectedCategory;

            const matchesSearch = normalizedQuery.length === 0 ||
                                    adventure.title.toLowerCase().includes(normalizedQuery) ||
                                    adventure.location_name.toLowerCase().includes(normalizedQuery) ||
                                    adventure.description.toLowerCase().includes(normalizedQuery);

            return matchesCategory && matchesSearch;
        });

        const grouped = filteredAdventures.reduce((groups, adventure) => {
            const [year, month] = adventure.adventure_date.split("-").map(Number);

            const sectionTitle = new Intl.DateTimeFormat("en-US", {
                month: "long",
                year: "numeric"
            }).format(new Date(year, month-1, 1));

            if(!groups[sectionTitle]) {
                groups[sectionTitle] = [];
            }

            groups[sectionTitle].push(adventure);

            return groups;
        }, {} as Record<string, Adventure[]>);

        return (Object.entries(grouped) as [string, Adventure[]][]).map(([title, sectionData]) => ({
            title,
            data: sectionData
        }));
    }, [data, searchQuery, selectedCategory]);

    const resultCount = sections.reduce((total, section) => total + section.data.length, 0);
    const hasActiveFilters = searchQuery.trim().length > 0 || selectedCategory !== "all";

    if(isLoading) {
        return(
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <View style={styles.centerState}>
                    <ActivityIndicator size="small" color={colors.forest} />

                    <Text style={styles.centerStateTitle}>
                        Opening your journal...
                    </Text>

                    <Text style={styles.centerStateDescription}>
                        Gathering your saved adventures.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if(isError) {
        const message = error instanceof ApiError ? error.message : "AdventureLog could not load your journal.";

        return (
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <View style={styles.centerState}>
                    <View style={styles.errorIcon}>
                        <Ionicons name="cloud-offline-outline" size={31} color={colors.danger} />
                    </View>

                    <Text style={styles.centerStateTitle}>
                        Journal unavailable
                    </Text>

                    <Text style={styles.centerStateDescription}>
                        {message}
                    </Text>

                    <Pressable
                        onPress={() => void refetch()}
                        style={({pressed}) => [styles.retryButton, pressed && styles.pressed]}
                    >
                        <Text style={styles.retryButtonText}>
                            Try again
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={false}
                contentContainerStyle={[styles.content, resultCount === 0 && styles.emptyContent]}
                ListHeaderComponent={
                    <View>
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.eyebrow}>
                                    Your memories
                                </Text>

                                <Text style={styles.title}>
                                    Adventure Journal
                                </Text>
                            </View>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Change journal view"
                                style={({pressed}) => [
                                    styles.viewButton, pressed && styles.pressed
                                ]}
                            >
                                <Ionicons name="grid-outline" size={21} color={colors.textPrimary} />
                            </Pressable>
                        </View>

                        <Text style={styles.description}>
                            Revist the places, moments, and stories you have collected along the way.
                        </Text>

                        <View style={styles.searchContainer}>
                            <Ionicons name="search-outline" size={20} color={colors.textMuted} />

                            <TextInput
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search memories or places"
                                placeholderTextColor={colors.textMuted}
                                returnKeyType="search"
                                style={styles.searchInput}
                            />

                            {searchQuery.length > 0 ? (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Clear search"
                                    onPress={() => setSearchQuery("")}
                                >
                                    <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                                </Pressable>
                            ): null}
                        </View>

                        {/* <SectionList
                            horizontal
                            sections={[
                                {
                                    title: "Categories",
                                    data: categoryFilters
                                }
                            ]}
                            keyExtractor={(item) => item.value}
                            renderItem={({item}) => {
                                const isSelected = selectedCategory === item.value;

                                return(
                                    <Pressable
                                        onPress={() => setSelectedCategory(item.value)}
                                        style={({pressed}) => [
                                            styles.filterChip, isSelected && styles.filterChipSelected, pressed && styles.pressed
                                        ]}
                                    >
                                        <Ionicons name={item.icon} size={15} color={isSelected ? colors.background : colors.textSecondary} />

                                        <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
                                            {item.label}
                                        </Text>
                                    </Pressable>
                                );
                            }}
                            renderSectionHeader={() => null}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filters}
                            style={styles.filterList}
                        /> */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filters}
                            style={styles.filterList}
                        >
                            {categoryFilters.map((filter) => {
                                const isSelected = selectedCategory === filter.value;

                                return(
                                    <Pressable
                                        key={filter.value}
                                        onPress={() => setSelectedCategory(filter.value)}
                                        style={({pressed}) => [
                                            styles.filterChip, isSelected && styles.filterChipSelected, pressed && styles.pressed,
                                        ]}
                                    >
                                        <Ionicons name={filter.icon} size={15} color={isSelected ? colors.background : colors.textSecondary} />

                                        <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
                                            {filter.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultText}>
                                {resultCount}{" "}
                                {resultCount === 1 ? "memory" : "memories"}
                            </Text>

                            <Pressable style={styles.sortButton}>
                                <Ionicons name="swap-vertical-outline" size={16} color={colors.forest} />

                                <Text style={styles.sortText}>
                                    Newest
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                }
                renderSectionHeader={({section}) => (
                    <View style={styles.monthHeader}>
                        <Text style={styles.monthTitle}>
                            {section.title}
                        </Text>

                        <View style={styles.monthLine} />
                    </View>
                )}
                renderItem={({item}) => (
                    <JournalAdventureCard 
                        adventure={item}
                        onPress={() => router.push({
                            pathname: "/adventures/[adventureId]",
                            params: {
                                adventureId: item.id,
                            }
                        })}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Ionicons name="map-outline" size={30} color={colors.forest} />
                        </View>

                        <Text style={styles.emptyTitle}>
                            {hasActiveFilters ? "No memories found" : "Your journal is waiting"}
                        </Text>

                        <Text style={styles.emptyDescription}>
                            {hasActiveFilters ? "Try another search or category to rediscover an adventure." : "Log your first adventure and it will appear here as part of your personal timeline."}
                        </Text>

                        {hasActiveFilters ? (
                            <Pressable
                                onPress={() => {
                                    setSearchQuery("");
                                    setSelectedCategory("all");
                                }}
                                style={({pressed}) => [
                                    styles.resetButton, pressed && styles.pressed
                                ]}
                            >
                                <Text style={styles.resetButtonText}>
                                    Reset filters
                                </Text>
                            </Pressable>
                        ): (
                            <Pressable
                                onPress={() => router.navigate("/(tabs)/create")}
                                style={({pressed}) => [styles.resetButton, pressed && styles.pressed]}
                            >
                                <Text style={styles.resetButtonText}>
                                    Log an adventure
                                </Text>
                            </Pressable>
                        )}
                    </View>
                }
                refreshControl={
                    <RefreshControl 
                        refreshing={isRefetching}
                        onRefresh={() => void refetch()}
                        tintColor={colors.forest}
                    />
                }
            />
        </SafeAreaView>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.background,
        },
        content: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.xxxl,
        },
        emptyContent: {
            flexGrow: 1,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        eyebrow: {
            color: colors.clay,
            fontSize: 12,
            fontWeight: "800",
            letterSpacing: 1.2,
            textTransform: "uppercase",
        },
        title: {
            marginTop: 5,
            color: colors.textPrimary,
            fontSize: 30,
            fontWeight: "800",
        },
        viewButton: {
            width: 46,
            height: 46,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 23,
        },
        pressed: {
            opacity: 0.82,
        },
        description: {
            maxWidth: 340,
            marginTop: spacing.md,
            color: colors.textSecondary,
            fontSize: 15,
            lineHeight: 22,
        },
        searchContainer: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            marginTop: spacing.xl,
            paddingHorizontal: spacing.lg,
            minHeight: 54,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 20,
        },
        searchInput: {
            flex: 1,
            color: colors.textPrimary,
            fontSize: 15,
        },
        filterList: {
            marginHorizontal: -spacing.lg,
            marginTop: spacing.lg,
        },
        filters: {
            gap: spacing.sm,
            paddingHorizontal: spacing.lg,
        },
        filterChip: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 999
        },
        filterChipSelected: {
            backgroundColor: colors.forest,
            borderColor: colors.forest,
        },
        filterText: {
            color: colors.textSecondary,
            fontSize: 13,
            fontWeight: "700",
        },
        filterTextSelected: {
            color: colors.background,
        },
        resultRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: spacing.xl,
        },
        resultText: {
            color: colors.textSecondary,
            fontSize: 13,
            fontWeight: "700"
        },
        sortButton: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
        },
        sortText: {
            color: colors.forest,
            fontSize: 13,
            fontWeight: "800"
        },
        monthHeader: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            marginTop: spacing.xxl,
            marginBottom: spacing.md,
        },
        monthTitle: {
            color: colors.textPrimary,
            fontSize: 19,
            fontWeight: "800",
        },
        monthLine: {
            flex: 1,
            height: 1,
            backgroundColor: colors.border,
        },
        cardWrapper: {
            marginBottom: spacing.lg,
        },
        emptyState: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.xxxl,
        },
        emptyIcon: {
            width: 68,
            height: 68,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 24,
        },
        emptyTitle: {
            marginTop: spacing.lg,
            color: colors.textPrimary,
            fontSize: 21,
            fontWeight: "800",
        },
        emptyDescription: {
            maxWidth: 290,
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: 14,
            lineHeight: 21,
            textAlign: "center",
        },
        resetButton: {
            marginTop: spacing.lg,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            backgroundColor: colors.forest,
            borderRadius: 999,
        },
        resetButtonText: {
            color: colors.background,
            fontSize: 13,
            fontWeight: "800",
        },
        centerState: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: spacing.xl,
        },
        errorIcon: {
            width: 68,
            height: 68,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 24,
        },
        centerStateTitle: {
            marginTop: spacing.lg,
            color: colors.textPrimary,
            fontSize: 21,
            fontWeight: "800",
            textAlign: "center"
        },
        centerStateDescription: {
            maxWidth: 300,
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: 14,
            lineHeight: 21,
            textAlign: "center"
        },
        retryButton: {
            marginTop: spacing.lg,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
            backgroundColor: colors.forest,
            borderRadius: 999
        },
        retryButtonText: {
            color: colors.background,
            fontSize: 13,
            fontWeight: "800"
        }
    });
}