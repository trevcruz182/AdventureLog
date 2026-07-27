import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { 
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { AppColors, spacing, useAppTheme } from "@/theme";

type AdventurePhotosStepProps = {
    photos: string[];
    onChangePhotos: (photos: string[]) => void;
};

const MAX_PHOTOS = 5;

export function AdventurePhotosStep({photos, onChangePhotos}: AdventurePhotosStepProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    async function selectFromLibrary() {
        if(photos.length >= MAX_PHOTOS) {
            Alert.alert("Photo limit reached", "You can add up to five photos.");
            return;
        }

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if(!permission.granted) {
            Alert.alert("Photo permission needed", "AdventureLog needs access to your photo library.");
            return;
        }

        const remainingSlots = MAX_PHOTOS - photos.length;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsMultipleSelection: true,
            selectionLimit: remainingSlots,
            quality: 0.85,
        });

        if(!result.canceled) {
            const selectedUris = result.assets.slice(0, remainingSlots).map((asset) => asset.uri);

            onChangePhotos([...photos, ...selectedUris]);

            await Haptics.selectionAsync();
        }
    }

    async function takePhoto() {
        if(photos.length >= MAX_PHOTOS) {
            Alert.alert("Photo limit reached", "You can add up to five photos.");
            return;
        }

        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if(!permission.granted) {
            Alert.alert("Camera permission needed", "AdventureLog needs camera access to take a photo.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.85,
        });

        if (!result.canceled) {
            onChangePhotos([...photos, result.assets[0].uri]);

            await Haptics.selectionAsync();
        }
    }

    function removePhoto(uri: string) {
        onChangePhotos(photos.filter((photo) => photo !== uri));
    }

    return(
        <View>
            <Text style={styles.heading}>Bring it back to life.</Text>

            <Text style={styles.description}>
                Add up to five photos. Your first photo will become the adventure&apos;s cover image.
            </Text>

            <View style={styles.actionRow}>
                <Pressable
                    onPress={() => void selectFromLibrary()}
                    style={({pressed}) => [styles.actionButton, pressed && styles.pressed]}
                >
                    <View style={styles.actionIcon}>
                        <Ionicons name="images-outline" size={23} color={colors.forest} />
                    </View>

                    <Text style={styles.actionTitle}>
                        Photo library
                    </Text>

                    <Text style={styles.actionDescription}>
                        Choose existing memories
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => void takePhoto()}
                    style={({pressed}) => [styles.actionButton, pressed && styles.pressed]}
                >
                    <View style={styles.actionIcon}>
                        <Ionicons name="camera-outline" size={23} color={colors.forest} />
                    </View>

                    <Text style={styles.actionTitle}>Camera</Text>

                    <Text style={styles.actionDescription}>
                        Capture one right now
                    </Text>
                </Pressable>
            </View>

            <View style={styles.photoHeading}>
                <Text style={styles.photoHeadingText}>
                    Selected photos
                </Text>

                <Text style={styles.photoCount}>
                    {photos.length}/{MAX_PHOTOS}
                </Text>
            </View>

            {photos.length > 0 ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.photoList}
                    style={styles.photoScroll}
                >
                    {photos.map((uri, index) => (
                        <View key={uri} style={styles.photoWrapper}>
                            <Image source={{uri}} style={styles.photo} />

                            {index === 0 ? (
                                <View style={styles.coverBadge}>
                                    <Text style={styles.coverText}>Cover</Text>
                                </View>
                            ): null}

                            <Pressable
                                onPress={() => removePhoto(uri)}
                                accessibilityLabel={`Remove photo ${index + 1}`}
                                style={styles.removeButton}
                            >
                                <Ionicons name="close" size={17} color="#FFFFFF" />
                            </Pressable>
                        </View>
                    ))}
                </ScrollView>
            ): (
                <View style={styles.emptyState}>
                    <Ionicons name="image-outline" size={35} color={colors.textMuted} />

                    <Text style={styles.emptyTitle}>
                        No photos selected
                    </Text>

                    <Text style={styles.emptyDescription}>
                        Photos are optional, but they make your journal more memorable.
                    </Text>
                </View>
            )}
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
        actionRow: {
            flexDirection: "row",
            gap: spacing.md,
            marginTop: spacing.xl,
        },
        actionButton: {
            flex: 1,
            minHeight: 142,
            padding: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 22,
        },
        actionIcon: {
            width: 42,
            height: 42,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 15,
        },
        actionTitle: {
            marginTop: spacing.md,
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: "800"
        },
        actionDescription: {
            marginTop: 3,
            color: colors.textSecondary,
            fontSize: 11,
            lineHeight: 16,
        },
        photoHeading: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: spacing.xl,
        },
        photoHeadingText: {
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: "800"
        },
        photoCount: {
            color: colors.textMuted,
            fontSize: 12,
            fontWeight: "700"
        },
        photoScroll: {
            marginHorizontal: -spacing.lg,
            marginTop: spacing.md,
        },
        photoList: {
            gap: spacing.md,
            paddingHorizontal: spacing.lg,
        },
        photoWrapper: {
            position: "relative"
        },
        photo: {
            width: 210,
            height: 170,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 22,
        },
        coverBadge: {
            position: "absolute",
            left: spacing.sm,
            bottom: spacing.sm,
            paddingHorizontal: 10,
            paddingVertical: 6,
            backgroundColor: "rgba(17, 23, 19, 0.70)",
            borderRadius: 999,
        },
        coverText: {
            color: "#FFFFFF",
            fontSize: 11,
            fontWeight: "800"
        },
        removeButton: {
            position: "absolute",
            top: spacing.sm,
            right: spacing.sm,
            width: 31,
            height: 31,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(17, 23, 19, 0.72)",
            borderRadius: 16,
        },
        emptyState: {
            alignItems: "center",
            marginTop: spacing.md,
            paddingVertical: spacing.xxl,
            paddingHorizontal: spacing.xl,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 24,
        },
        emptyTitle: {
            marginTop: spacing.md,
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: "800",
        },
        emptyDescription: {
            maxWidth: 270,
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: 13,
            lineHeight: 19,
            textAlign: "center",
        },
        pressed: {
            opacity: 0.82,
        }
    });
}