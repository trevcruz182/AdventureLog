import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, useWatch } from "react-hook-form";

import { useAdventure, useUpdateAdventure } from "@/features/adventures/useAdventures";
import { AdventureBasicsStep } from "@/components/create/AdventureBasicsStep";
import { AdventurePlaceStep } from "@/components/create/AdventurePlaceStep";
import { AdventureReviewStep } from "@/components/create/AdventureReviewStep";
import { AdventureStepIndicator } from "@/components/create/AdventureStepIndicator";
import { AdventurePhotosStep } from "@/components/create/AdventurePhotosStep";
import type { Adventure, AdventurePhotoCreate } from "@/types/adventure";
import type { UploadedImage } from "@/types/media";
import { CreateAdventureDefaultValues, CreateAdventureFormValues, createAdventureSchema } from "@/features/adventures/createAdventureSchema";
import { ApiError } from "@/lib/api/ApiError";
import { deleteUploadedImageRequest, uploadImageRequest } from "@/lib/api/media";
import { useNetworkStatus } from "@/features/network/NetworkProvider";
import { AppColors, spacing, useAppTheme } from "@/theme";

const TOTAL_STEPS = 4;

const stepFields: Record<number, Array<keyof CreateAdventureFormValues>> = {
    1: [
        "title",
        "status",
        "category",
        "description",
        "date"
    ],
    2: [
        "locationName",
        "latitude",
        "longitude"
    ],
    3: ["photos"],
    4: [
        "rating",
        "isFavorite"
    ],
};

type UploadProgress = {
    completed: number;
    total: number;
};

async function cleanupUploadedImages(publicIds: string[]): Promise<void> {
    await Promise.allSettled(publicIds.map((publicId) => deleteUploadedImageRequest(publicId)));
}

function roundCoordinate(value: number | null): number | null {
    if(value === null) {
        return null;
    }

    return Number(value.toFixed(6));
}

export default function EditAdventureScreen() {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const {isOnline} = useNetworkStatus();

    const params = useLocalSearchParams<{adventureId?: string | string[]}>();

    const adventureId = Array.isArray(params.adventureId) ? params.adventureId[0] : params.adventureId;

    const {
        data,
        isLoading,
        isError
    } = useAdventure(adventureId);

    const updateMutation = useUpdateAdventure();

    const adventure: Adventure | undefined = data;

    const [currentStep, setCurrentStep] = useState(1);

    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

    const {
        control,
        formState: {errors, isDirty},
        getValues,
        handleSubmit,
        reset,
        setValue,
        trigger
    } = useForm<CreateAdventureFormValues>({
        resolver: zodResolver(createAdventureSchema),
        defaultValues: CreateAdventureDefaultValues,
        mode: "onBlur"
    });

    const latitude = useWatch({
        control, 
        name: "latitude"
    });

    const longitude = useWatch({
        control,
        name: "longitude"
    });

    const photos = useWatch({
        control,
        name: "photos"
    });

    const reviewValues = useWatch({
        control
    }) as CreateAdventureFormValues;

    useEffect(() => {
        if(!adventure) {
            return;
        }

        reset({
            title: adventure.title,
            status: adventure.status,
            category: adventure.category,
            description: adventure.description,
            date: adventure.adventure_date,
            locationName: adventure.location_name,
            latitude: adventure.latitude === null ? null : Number(adventure.latitude),
            longitude: adventure.longitude === null ? null : Number(adventure.longitude),
            rating: adventure.rating,
            isFavorite: adventure.is_favorite,
            photos: adventure.photos.map((photo) => photo.image_url) // Photo urls are remote, so nothing is submitted at this point and photos will remain unchanged.
        });
    }, [adventure, reset]);

    async function goForward() {
        const fields = stepFields[currentStep];

        const isValid = await trigger(fields, {
            shouldFocus: true,
        });

        if(!isValid) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            return;
        }

        if(currentStep < TOTAL_STEPS) {
            setCurrentStep((step) => step + 1);
            await Haptics.selectionAsync();
        }
    }

    async function goBack() {
        if(currentStep > 1) {
            setCurrentStep((step) => step -1);

            await Haptics.selectionAsync();
        }
    }

    async function submitUpdate(values: CreateAdventureFormValues) {
        if(!isOnline) {
            Alert.alert("You're offline", "Reconnect before updating this adventure.");

            return;
        }

        if(!adventureId || !adventure) {
            return;
        }

        const existingPhotosByUrl = new Map(adventure.photos.map((photo) => [photo.image_url, photo]));

        const newPhotoCount = values.photos.filter((photoUri) => !existingPhotosByUrl.has(photoUri)).length;

        const newlyUploadedImages: UploadedImage[] = [];

        const finalPhotos: AdventurePhotoCreate[] = [];

        try {
            if(newPhotoCount > 0) {
                setUploadProgress({
                    completed: 0,
                    total: newPhotoCount,
                });
            }

            let completedUploads = 0;

            // process the photos in their displayed order. preserves first photo as cover image.
            for(let index = 0; index < values.photos.length; index += 1) {
                const photoUri = values.photos[index];

                const existingPhoto = existingPhotosByUrl.get(photoUri);

                if(existingPhoto) {
                    finalPhotos.push({
                        image_url: existingPhoto.image_url,
                        public_id: existingPhoto.public_id
                    });

                    continue;
                }

                const uploadedImage = await uploadImageRequest({
                    uri: photoUri,
                    fileName: null,
                    mimeType: null,
                }, index);

                newlyUploadedImages.push(uploadedImage);

                finalPhotos.push({
                    image_url: uploadedImage.image_url,
                    public_id: uploadedImage.public_id
                });

                completedUploads += 1;

                setUploadProgress({
                    completed: completedUploads,
                    total: newPhotoCount
                });
            }

            await updateMutation.mutateAsync({adventureId, 
                payload: {
                    title: values.title.trim(),
                    status: values.status,
                    description: values.description.trim(),
                    category: values.category,
                    adventure_date: values.date,
                    location_name: values.locationName.trim(),
                    latitude: roundCoordinate(values.latitude),
                    longitude: roundCoordinate(values.longitude),
                    rating: values.rating,
                    is_favorite: values.isFavorite,
                    photos: finalPhotos,
                }
            });

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            router.back();
        }
        catch (error) {
            await cleanupUploadedImages(newlyUploadedImages.map((image) => image.public_id));

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            const message = error instanceof ApiError ? error.message : "AdventureLog could not update this adventure.";

            Alert.alert("Adventure not updated", message);
        }
        finally {
            setUploadProgress(null);
        }
    }

    function cancelEditing() {
        if(!isDirty) {
            router.back();
            return;
        }

        Alert.alert("Discard your changes?", "Your edits will not be saved.", [
            {
                text: "Keep editing",
                style: "cancel"
            },
            {
                text: "Discard",
                style: "destructive",
                onPress: () => router.back()
            }
        ]);
    }

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

    const isSaving = updateMutation.isPending || uploadProgress !== null;

    return(
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={90}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.eyebrow}>
                            Update memory
                        </Text>

                        <Text style={styles.title}>
                            Edit adventure
                        </Text>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Cancel editing"
                        disabled={isSaving}
                        onPress={cancelEditing}
                        style={({pressed}) => [styles.headerButton, pressed && styles.pressed, isSaving && styles.disabled]}
                    >
                        <Ionicons name="close" size={22} color={colors.textPrimary} />
                    </Pressable>
                </View>

                <AdventureStepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {currentStep === 1 ? (
                        <AdventureBasicsStep control={control} errors={errors} />
                    ): null}

                    {currentStep === 2 ? (
                        <AdventurePlaceStep control={control} errors={errors} setValue={setValue} latitude={latitude} longitude={longitude} />
                    ): null}

                    {currentStep === 3 ? (
                        <AdventurePhotosStep 
                            photos={photos}
                            onChangePhotos={(nextPhotos) => setValue("photos", nextPhotos, {
                                shouldDirty: true,
                                shouldValidate: true
                            })}
                        />
                    ): null}

                    {currentStep === 4 ? (
                        <AdventureReviewStep 
                            values={reviewValues}
                            heading="Review your changes."
                            description="Make sure the updated details look right before saving."
                            onChangeRating={(rating) => setValue("rating", rating, {
                                shouldDirty: true,
                            })}
                            onToggleFavorite={() => setValue("isFavorite", !getValues("isFavorite"), {
                                shouldDirty: true
                            })}
                        />
                    ): null}
                </ScrollView>

                <View style={styles.footer}>
                    {currentStep > 1 ? (
                        <Pressable
                            disabled={isSaving}
                            onPress={() => void goBack()}
                            style={({pressed}) => [styles.secondaryButton, pressed && styles.pressed, isSaving && styles.disabled]}
                        >
                            <Ionicons name="arrow-back" size={18} color={colors.textPrimary} />

                            <Text style={styles.secondaryButtonText}>
                                Back
                            </Text>
                        </Pressable>
                    ): null}

                    {currentStep < TOTAL_STEPS ? (
                        <Pressable
                            onPress={() => void goForward()}
                            disabled={isSaving}
                            style={({pressed}) => [styles.primaryButton, pressed && !isSaving && styles.pressed, isSaving && styles.disabled]}
                        >
                            <Text style={styles.primaryButtonText}>
                                Continue
                            </Text>

                            <Ionicons name="arrow-forward" size={18} color={colors.background} />
                        </Pressable>
                    ): (
                        <View style={styles.finalStepActions}>
                            {uploadProgress && uploadProgress.total > 0 ? (
                                <View style={styles.uploadProgressCard}>
                                    <ActivityIndicator size="small" color={colors.forest} />

                                    <View style={styles.uploadProgressText}>
                                        <Text style={styles.uploadProgressTitle}>
                                            Uploading new photos
                                        </Text>

                                        <Text style={styles.uploadProgressDescription}>
                                            {uploadProgress.completed} of{" "}
                                            {uploadProgress.total} complete
                                        </Text>
                                    </View>
                                </View>
                            ): null}

                            <Pressable
                                accessibilityRole="button"
                                disabled={isSaving || !isDirty}
                                onPress={handleSubmit(submitUpdate)}
                                style={({pressed}) => [styles.primaryButton, pressed && !isSaving && styles.pressed, (isSaving || !isDirty) && styles.disabled]}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color={colors.background} />
                                ): (
                                    <>
                                        <Ionicons name="checkmark" size={19} color={colors.background} />

                                        <Text style={styles.primaryButtonText}>
                                            Save changes
                                        </Text>
                                    </>
                                )}
                            </Pressable>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.background
        },
        keyboardView: {
            flex: 1,
        },
        header: {
            minHeight: 64,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
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
            color: colors.clay,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 1.1,
            textTransform: "uppercase"
        },
        title: {
            marginTop: 3,
            color: colors.textPrimary,
            fontSize: 25,
            fontWeight: "800"
        },
        scrollContent: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xl,
            paddingBottom: spacing.xxxl,
        },
        footer: {
            flexDirection: "row",
            gap: spacing.md,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.lg,
            backgroundColor: colors.background,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border
        },
        primaryButton: {
            flex: 1,
            minHeight: 54,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            backgroundColor: colors.forest,
            borderRadius: 18
        },
        primaryButtonText: {
            color: colors.background,
            fontSize: 14,
            fontWeight: "800"
        },
        secondaryButton: {
            minWidth: 108,
            minHeight: 54,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 18
        },
        secondaryButtonText: {
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: "800"
        },
        pressed: {
            opacity: 0.82
        },
        disabled: {
            opacity: 0.55
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
        },
        finalStepActions: {
            flex: 1,
            gap: spacing.md,
        },
        uploadProgressCard: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            padding: spacing.md,
            backgroundColor: colors.surfaceMuted,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16
        },
        uploadProgressText: {
            flex: 1,
        },
        uploadProgressTitle: {
            color: colors.textPrimary,
            fontSize: 13,
            fontWeight: "800",
        },
        uploadProgressDescription: {
            marginTop: 3,
            color: colors.textSecondary,
            fontSize: 12,
        }
    });
}