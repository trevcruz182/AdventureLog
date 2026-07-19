import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAdventure } from "@/features/adventures/useAdventures";
import { AppColors, spacing, useAppTheme } from "@/theme";

export default function EditAdventureScreen() {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const params = useLocalSearchParams<{adventureId?: string | string[]}>();

    const adventureId = Array.isArray(params.adventureId) ? params.adventureId[0] : params.adventureId;

    const {
        data: adventure,
        isLoading,
        isError
    } = useAdventure(adventureId);

    if(isLoading) {
        return(
            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                <View style={styles.centerState}>
                    <ActivityIndicator size="small" color={colors.forest} />

                    <Text style={styles.stateTitle}>
                        Preparing your adventure...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if(isError || !adventure || !adventureId) {
        return(
            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                <View style={styles.header}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                        onPress={() => router.back()}
                        style={styles.headerButton}
                    >
                        <Ionicons name="arrow-back" size={21} color={colors.textPrimary} />
                    </Pressable>
                </View>

                <View style={styles.centerState}>
                    <Ionicons name="alert-circle-outline" size={34} color={colors.danger} />

                    <Text style={styles.stateTitle}>
                        Adventure unavailable
                    </Text>

                    <Text style={styles.stateDescription}>
                        AdventureLog could not prepare this adventure for editing.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return(
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            <View style={styles.header}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Cancel editing"
                    onPress={() => router.back()}
                    style={styles.headerButton}
                >
                    <Ionicons name="close" size={22} color={colors.textPrimary} />
                </Pressable>
            </View>

            <View style={styles.centerState}>
                <View style={styles.editIcon}>
                    <Ionicons name="pencil-outline" size={28} color={colors.forest} />
                </View>

                <Text style={styles.eyebrow}>
                    Edit adventure
                </Text>

                <Text style={styles.adventureTitle}>
                    {adventure.title}
                </Text>

                <Text style={styles.stateDescription}>
                    The connected editing form will appear here.
                </Text>
            </View>
        </SafeAreaView>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.background
        },
        header: {
            minHeight: 64,
            justifyContent: "center",
            paddingHorizontal: spacing.lg,
        },
        headerButton: {
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 22
        },
        centerState: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: spacing.xl,
        },
        editIcon: {
            width: 64,
            height: 64,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 22,
        },
        eyebrow: {
            marginTop: spacing.xl,
            color: colors.clay,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 1.1,
            textTransform: "uppercase"
        },
        adventureTitle: {
            marginTop: spacing.sm,
            color: colors.textPrimary,
            fontSize: 28,
            fontWeight: "800",
            textAlign: "center"
        },
        stateTitle: {
            marginTop: spacing.lg,
            color: colors.textPrimary,
            fontSize: 20,
            fontWeight: "800",
            textAlign: "center",
        },
        stateDescription: {
            maxWidth: 300,
            marginTop: spacing.md,
            color: colors.textSecondary,
            fontSize: 14,
            lineHeight: 21,
            textAlign: "center"
        }
    });
}