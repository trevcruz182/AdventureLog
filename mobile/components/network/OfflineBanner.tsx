import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNetworkStatus } from "@/features/network/NetworkProvider";
import { AppColors, spacing, useAppTheme } from "@/theme";

export function OfflineBanner() {
    const {colors} = useAppTheme();
    const {isOnline, isReady} = useNetworkStatus();
    const styles = createStyles(colors);

    if(!isReady || isOnline) {
        return null;
    }

    return(
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
            <View style={styles.banner} accessibilityRole="alert">
                <Ionicons name="cloud-offline-outline" size={17} color="#FFFFFF" />

                <Text style={styles.text}>
                    You're offline. Saved memories remain available.
                </Text>
            </View>
        </SafeAreaView>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        safeArea: {
            backgroundColor: colors.clay,
        },
        banner: {
            minHeight: 38,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            backgroundColor: colors.clay,
        },
        text: {
            flexShrink: 1,
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: "800",
            textAlign: "center"
        }
    });
}