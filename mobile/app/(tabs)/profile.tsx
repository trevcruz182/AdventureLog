// Temp code so I can test the dark vs light mode styles. Will later be replaced with settings toggle
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View, Alert, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AchievementRow } from "@/components/profile/AchievementRow";
import { AppearanceSelector } from "@/components/profile/AppearanceSelector";
import { ProfileCollectionCard } from "@/components/profile/ProfileCollectionCard";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { SettingsRow } from "@/components/profile/SettingsRow";
import { profileAchievements, profileCollections, profileStats } from "@/data/profile";

import { AppearancePreference, AppColors, spacing, useAppTheme } from "@/theme";

const options: Array<{label: string; value: AppearancePreference;}> = [
    {label: "System", value: "system"},
    {label: "Light", value: "light"},
    {label: "Dark", value: "dark"},
];

export default function ProfileScreen() {
    const {colors, resolvedAppearance} = useAppTheme();
    const styles = createStyles(colors);

    return(
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              <View style={styles.header}>
                <View>
                  <Text style={styles.eyebrow}>
                    Your trail
                  </Text>

                  <Text style={styles.pageTitle}>
                    Profile
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Edit profile"
                  style={({pressed}) => [styles.editButton, pressed && styles.pressed]}
                >
                  <Ionicons name="pencil-outline" size={20} color={colors.textPrimary} />
                </Pressable>
              </View>

              <View style={styles.identity}>
                <View style={styles.avatarWrapper}>
                  <Image style={styles.avatar} source={{uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}} />

                  <View style={styles.levelBadge}>
                    <Ionicons name="compass" size={14} color="#FFFFFF" />
                  </View>
                </View>

                <Text style={styles.name}>
                  Trevor Cruz
                </Text>

                <Text style={styles.username}>
                  @trevorwanders
                </Text>

                <Text style={styles.bio}>
                  Collecting good views, memorable plaecs, and every rink worth visiting.
                </Text>
              </View>

              <ProfileStats stats={profileStats} />

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionEyebrow}>
                      In progress
                    </Text>

                    <Text style={styles.sectionTitle}>
                      Collections
                    </Text>
                  </View>

                  <Pressable>
                    <Text style={styles.sectionLink}>
                      View all
                    </Text>
                  </Pressable>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                  style={styles.horizontalScroll}
                >
                  {profileCollections.map((collection) => (
                    <ProfileCollectionCard key={collection.id} collection={collection} />
                  ))}
                </ScrollView>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionEyebrow}>
                      Milestones
                    </Text>

                    <Text style={styles.sectionTitle}>
                      Recent achievements
                    </Text>
                  </View>

                  <Pressable>
                    <Text style={styles.sectionLink}>
                      See all
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.panel}>
                  {profileAchievements.map((achievement, index) => (
                    <AchievementRow 
                      key={achievement.id}
                      achievement={achievement}
                      isLast={index === profileAchievements.length -1}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionEyebrow}>
                  Preferences
                </Text>

                <Text style={styles.sectionDescription}>
                  AdventureLog is currently using the{" "}
                  {resolvedAppearance} theme.
                </Text>

                <View style={styles.appearanceWrapper}>
                  <AppearanceSelector />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionEyebrow}>
                  Account
                </Text>

                <Text style={styles.sectionTitle}>
                  Settings
                </Text>

                <View style={styles.panel}>
                  <SettingsRow icon="person-outline" title="Personal information" description="Name, username, and profile photo" />

                  <SettingsRow icon="notifications-outline" title="Notifications" description="Reminders, achievements, and activity" />

                  <SettingsRow icon="shield-checkmark-outline" title="Privacy and data" description="Location, photos, and account data" />

                  <SettingsRow icon="help-circle-outline" title="Help and feedback" description="Get support or share an idea" isLast />
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  Alert.alert("Sign out", "Authentication will be connected when the backend is added.");
                }}
                style={({pressed}) => [styles.signOutButton, pressed && styles.pressed]}
              >
                <Ionicons name="log-out-outline" size={19} color={colors.danger} />

                <Text style={styles.signOutText}>
                  Sign out
                </Text>
              </Pressable>

              <Text style={styles.version}>
                AdventureLog · Development Build
              </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
      safeArea: {
        flex: 1,
        backgroundColor: colors.background
      },
      content: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.xxxl,
      },
      header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
      },
      eyebrow: {
        color: colors.clay,
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 1.1,
        textTransform: "uppercase",
      },
      pageTitle: {
        marginTop: 4,
        color: colors.textPrimary,
        fontSize: 30,
        fontWeight: "800",
      },
      editButton: {
        width:46,
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
      identity: {
        alignItems: "center",
        paddingVertical: spacing.xl,
      },
      avatarWrapper: {
        position: "relative"
      },
      avatar: {
        width: 104,
        height: 104,
        backgroundColor: colors.surfaceMuted,
        borderWidth: 4,
        borderColor: colors.surface,
        borderRadius: 40,
      },
      levelBadge: {
        position: "absolute",
        right: -3,
        bottom: 3,
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.clay,
        borderWidth: 3,
        borderColor: colors.clay,
        borderRadius: 16
      },
      name: {
        marginTop: spacing.lg,
        color: colors.textPrimary,
        fontSize: 24,
        fontWeight: "800"
      },
      username: {
        marginTop: 4,
        color: colors.textMuted,
        fontSize: 13,
        fontWeight: "700"
      },
      bio: {
        maxWidth: 320,
        marginTop: spacing.md,
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 21,
        textAlign: "center"
      },
      section: {
        marginTop: spacing.xxl,
      },
      sectionHeader: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: spacing.md,
      },
      sectionEyebrow: {
        color: colors.textMuted,
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 1.1,
        textTransform: "uppercase"
      },
      sectionTitle: {
        marginTop: 3,
        color: colors.textPrimary,
        fontSize: 21,
        fontWeight: "800"
      },
      sectionDescription: {
        marginTop: spacing.sm,
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 19
      },
      sectionLink: {
        color: colors.forest,
        fontSize: 13,
        fontWeight: "800"
      },
      horizontalScroll: {
        marginHorizontal: -spacing.lg,
      },
      horizontalList: {
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
      },
      panel: {
        marginTop: spacing.md,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 24,
      },
      appearanceWrapper: {
        marginTop: spacing.md,
      },
      signOutButton: {
        minHeight: 54,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        marginTop: spacing.xxl,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 18
      },
      signOutText: {
        color: colors.danger,
        fontSize: 14,
        fontWeight: "800"
      },
      version: {
        marginTop: spacing.lg,
        color: colors.textMuted,
        fontSize: 11,
        fontWeight: "600",
        textAlign: "center"
      }
    });
  }