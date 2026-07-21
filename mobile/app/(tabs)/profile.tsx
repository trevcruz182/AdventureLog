import { Ionicons } from "@expo/vector-icons";
import { Pressable, ActivityIndicator, RefreshControl, StyleSheet, Text, View, Alert, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { AchievementRow } from "@/components/profile/AchievementRow";
import { AppearanceSelector } from "@/components/profile/AppearanceSelector";
import { ProfileCollectionCard } from "@/components/profile/ProfileCollectionCard";
import { ProfileStats } from "@/components/profile/ProfileStats";
// import { SettingsRow } from "@/components/profile/SettingsRow";
// import { profileAchievements, profileCollections, profileStats } from "@/data/profile";
import type { AdventureAchievement, ProfileStat } from "@/data/profile";
import { useAdventures } from "@/features/adventures/useAdventures";
import { useCollections } from "@/features/collections/useCollections";
import { ApiError } from "@/lib/api/ApiError";
import { useAuth } from "@/features/auth/AuthProvider";
import { Adventure } from "@/types/adventure";

import { AppColors, spacing, useAppTheme } from "@/theme";
import { AdventureCollection } from "@/types/collection";

function formatAchievementDate(value: string): string {
  	const [year, month, day] = value.split("-").map(Number);

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(year, month-1, day));
}

export default function ProfileScreen() {
    const {colors, resolvedAppearance} = useAppTheme();

	const {
		data,
		isLoading,
		isError,
		error,
		refetch,
		isRefetching
	} = useAdventures({limit: 100});

  const collectionsQuery = useCollections();

  const styles = createStyles(colors);

	const adventures: Adventure[] = data?.items ?? [];

	const uniquePlaces = new Set(adventures.map((adventure) => adventure.location_name.trim().toLowerCase()).filter(Boolean)).size;

	const favoriteCount = adventures.filter((adventure) => adventure.is_favorite).length;

	const realProfileStats: ProfileStat[] = [
		{
			id: "adventures",
			label: "Adventures",
			value: String(data?.total ?? adventures.length)
		},
		{
			id: "places",
			label: "Places",
			value: String(uniquePlaces)
		},
		{
			id: "favorites",
			label: "Favorites",
			value: String(favoriteCount)
		},
	]

	const adventuresOldestFirst = [...adventures].sort((first, second) => first.adventure_date.localeCompare(second.adventure_date));

	const adventuresWithPhotos = adventuresOldestFirst.filter((adventure) => adventure.photos.length > 0);

	const earnedAchievements: AdventureAchievement[] = [];

	const firstAdventure = adventuresOldestFirst[0];

	if(firstAdventure) {
		earnedAchievements.push({
			id: "first-mark",
			title: "First Mark",
			description: "Logged your first AdventureLog memory.",
			earnedDate: formatAchievementDate(firstAdventure.adventure_date),
			icon: "trail-sign-outline"
		});
	}

	const fifthAdventure = adventuresOldestFirst[4];

	if(fifthAdventure) {
		earnedAchievements.push({
			id: "first-five",
			title: "First Five",
			description: "Collected five adventure memories.",
			earnedDate: formatAchievementDate(fifthAdventure.adventure_date),
			icon: "compass-outline"
		});
	}

	const thirdPhotoAdventure = adventuresWithPhotos[2];

	if(thirdPhotoAdventure) {
		earnedAchievements.push({
			id: "memory-keeper",
			title: "Memory Keeper",
			description: "Added photos to three adventures.",
			earnedDate: formatAchievementDate(thirdPhotoAdventure.adventure_date),
			icon: "camera-outline"
		});
	}

    const {user, logout} = useAuth();

    return(
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
              refreshControl={
              <RefreshControl 
                refreshing={isRefetching || collectionsQuery.isRefetching}
                onRefresh={() => void Promise.all([refetch(), collectionsQuery.refetch()])}
                tintColor={colors.forest}
              />
              }
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

                {/* <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Edit profile"
                  style={({pressed}) => [styles.editButton, pressed && styles.pressed]}
                >
                  <Ionicons name="pencil-outline" size={20} color={colors.textPrimary} />
                </Pressable> */}
              </View>

              <View style={styles.identity}>
                <View style={styles.avatarWrapper}>
                  <View style={styles.avatar}>
					<Text style={styles.avatarText}>
						{user?.display_name?.trim().charAt(0).toUpperCase() || "A"}
					</Text>
				  </View>

                  <View style={styles.levelBadge}>
                    <Ionicons name="compass" size={14} color="#FFFFFF" />
                  </View>
                </View>

                <Text style={styles.name}>
                  {user?.display_name ?? "AdventureLog User"}
                </Text>

                <Text style={styles.username}>
                  @{user?.username ?? "explorer"}
                </Text>

                <Text style={styles.email}>
                  {user?.email}
                </Text>

                <Text style={styles.bio}>
					Your personal collection of places, experiences, and memories.
                </Text>
              </View>

              {/* <ProfileStats stats={profileStats} /> */}
			  {isLoading ? (
				<View style={styles.profileDataState}>
					<ActivityIndicator size="small" color={colors.forest} />

					<Text style={styles.profileDataStateText}>
						Gathering your adventure history...
					</Text>
				</View>
			  ): isError ? (
				<View style={styles.profileErrorState}>
					<Text style={styles.profileErrorTitle}>
						Adventure history unavailable
					</Text>

					<Text style={styles.profileErrorDescription}>
						{error instanceof ApiError ? error.message : "AdventureLog could not load your profile statistics."}
					</Text>

					<Pressable
						disabled={isRefetching}
						onPress={() => void refetch()}
						style={({pressed}) => [styles.retryButton, pressed && styles.pressed]}
					>
						{isRefetching ? (
							<ActivityIndicator size="small" color={colors.background} />
						): (
							<Text style={styles.retryButtonText}>
								Try again
							</Text>
						)}
					</Pressable>
				</View>
			  ): (
				<ProfileStats stats={realProfileStats} />
			  )}

              {/* <View style={styles.section}>
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
              </View> */}

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

                {/* <View style={styles.panel}> */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Collections
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/collections")}
            >
              <Text style={styles.sectionLink}>
                View all
              </Text>
            </Pressable>
          </View>

          {collectionsQuery.isLoading ? (
            <View style={styles.collectionLoadingState}>
              <ActivityIndicator size="small" color={colors.forest} />

              <Text style={styles.collectionLoadingText}>
                Loading collections...
              </Text>
            </View>
          ): collectionsQuery.isError ? (
            <View style={styles.collectionErrorState}>
              <Text style={styles.collectionErrorText}>
                Collections could not be loaded.
              </Text>

              <Pressable
                onPress={() => void collectionsQuery.refetch()}
              >
                <Text style={styles.sectionLink}>
                  Try again
                </Text>
              </Pressable>
            </View>
          ): collectionsQuery.data && collectionsQuery.data.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              style={styles.horizontalScroll}
            >
              {collectionsQuery.data.map((collection: AdventureCollection) => (
                <ProfileCollectionCard key={collection.id} collection={collection} />
              ))}
            </ScrollView>
          ): (
            <Pressable 
              accessibilityRole="button"
              onPress={() => router.push("/collections/create")}
              style={({pressed}) => [styles.emptyCollectionState, pressed && styles.pressed]}
            >
              <Ionicons name="albums-outline" size={25} color={colors.forest} />

              <View style={styles.emptyCollectionContent}>
                <Text style={styles.emptyCollectionTitle}>
                  No collections yet
                </Text>

                <Text style={styles.emptyCollectionDescription}>
                  Create themed groups for the adventures you want to remember.
                </Text>

                <Ionicons name="arrow-forward" size={20} color={colors.forest} />
              </View>
            </Pressable>
          )}
        </View>

				{!isLoading && !isError ? (
					earnedAchievements.length > 0 ? (
						<View style={styles.panel}>
							{earnedAchievements.map((achievement, index) => (
								<AchievementRow 
									key={achievement.id}
									achievement={achievement}
									// showDivider={index < earnedAchievements.length-1}
								/>
							))}
						</View>
					) : (
						<View style={styles.emptyAchievementState}>
							<Text style={styles.emptyAchievementTitle}>
								Your first bade is waiting
							</Text>

							<Text style={styles.emptyAchievementDescription}>
								Log your first adventure to earn First Mark.
							</Text>
						</View>
					)
				): null}
                {/* </View> */}
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

                {/* <View style={styles.panel}>
                  <SettingsRow icon="person-outline" title="Personal information" description="Name, username, and profile photo" />

                  <SettingsRow icon="notifications-outline" title="Notifications" description="Reminders, achievements, and activity" />

                  <SettingsRow icon="shield-checkmark-outline" title="Privacy and data" description="Location, photos, and account data" />

                  <SettingsRow icon="help-circle-outline" title="Help and feedback" description="Get support or share an idea" isLast />
                </View> */}
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  Alert.alert("Sign out?", "You can sign back in at any time.", [
                    {
                      text: "Cancel",
                      style: "cancel"
                    },
                    {
                      text: "Sign out",
                      style: "destructive",
                      onPress: () => void logout(),
                    }
                  ]);
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
		alignItems: "center",
		justifyContent: "center",
        backgroundColor: colors.forest,
        borderWidth: 4,
        borderColor: colors.surface,
        borderRadius: 52,
      },
	  avatarText: {
		color: colors.background,
		fontSize: 38,
		fontWeight: "800"
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
      email: {
        marginTop: 5,
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: "600"
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
      },
      profileDataState: {
        minHeight: 110,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        marginTop: spacing.lg,
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 22,
      },
      profileDataStateText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: "600"
      },
      profileErrorState: {
        alignItems: "center",
        marginTop: spacing.lg,
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.danger,
        borderRadius: 22,
      },
      profileErrorTitle: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "800",
        textAlign: "center"
      },
      profileErrorDescription: {
        marginTop: spacing.sm,
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 19,
        textAlign: "center"
      },
      retryButton: {
        minWidth: 100,
        minHeight: 42,
        alignItems: "center",
        justifyContent: "center",
        marginTop: spacing.md,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.forest,
        borderRadius: 999
      },
      retryButtonText: {
        color: colors.background,
        fontSize: 13,
        fontWeight: "800"
      },
      emptyAchievementState: {
        marginTop: spacing.md,
        padding: spacing.xl,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 22,
      },
      emptyAchievementTitle: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "800",
        textAlign: "center"
      },
      emptyAchievementDescription: {
        marginTop: spacing.sm,
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 19,
        textAlign: "center"
      },
      collectionLoadingState: {
        minHeight: 120,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 22,
      },
      collectionLoadingText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: "600"
      },
      collectionErrorState: {
        minHeight: 100,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.danger,
        borderRadius: 22,
      },
      collectionErrorText: {
        color: colors.textSecondary,
        fontSize: 13,
        textAlign: "center"
      },
      emptyCollectionState: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 22,
      },
      emptyCollectionContent: {
        flex: 1
      },
      emptyCollectionTitle: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "800"
      },
      emptyCollectionDescription: {
        marginTop: 4,
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 18
      },
    });
  }