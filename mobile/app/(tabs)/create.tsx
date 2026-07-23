import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { 
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {useForm, useWatch} from "react-hook-form";
import { router } from "expo-router";

import { useNetworkStatus } from "@/features/network/NetworkProvider";
import { useCreateAdventure } from "@/features/adventures/useAdventures";
import { ApiError } from "@/lib/api/ApiError";
import type { AdventureCreatePayload } from "@/types/adventure";

import { AdventureBasicsStep } from "@/components/create/AdventureBasicsStep";
import { AdventurePhotosStep } from "@/components/create/AdventurePhotosStep";
import { AdventurePlaceStep } from "@/components/create/AdventurePlaceStep";
import { AdventureReviewStep } from "@/components/create/AdventureReviewStep";
import { AdventureStepIndicator } from "@/components/create/AdventureStepIndicator";
import { CreateAdventureDefaultValues, CreateAdventureFormValues, createAdventureSchema } from "@/features/adventures/createAdventureSchema";
import { AppColors, spacing, useAppTheme } from "@/theme";
import { deleteUploadedImageRequest, uploadImageRequest } from "@/lib/api/media";
import { UploadedImage } from "@/types/media";

const TOTAL_STEPS = 4;

const stepFields: Record<number, Array<keyof CreateAdventureFormValues>> = {
    1: ["title", "status", "category", "description", "date"],
    2: ["locationName", "latitude", "longitude"],
    3: ["photos"],
    4: ["rating", "isFavorite"],
};

type UploadProgress = {
    completed: number;
    total: number;
}

async function cleanupUploadedImages(publidIds: string[]): Promise<void> {
    await Promise.allSettled(publidIds.map((publicId) => deleteUploadedImageRequest(publicId)));
}

export default function CreateScreen() {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const {isOnline} = useNetworkStatus();

    const [currentStep, setCurrentStep] = useState(1);
    const [isSaved, setIsSaved] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

    const {
        control,
        formState: {errors},
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

    const photos = useWatch({
        control,
        name: "photos"
    });

    const latitude = useWatch({
        control,
        name: "latitude"
    });

    const longitude = useWatch({
        control,
        name: "longitude"
    });

    const reviewValues = useWatch({control}) as CreateAdventureFormValues;

    const createAdventureMutation = useCreateAdventure();

    const isSaving = createAdventureMutation.isPending || uploadProgress !== null;

    async function goForward() {
        const fields = stepFields[currentStep];

        const isValid = await trigger(fields, {
            shouldFocus: true
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
            setCurrentStep((step) => step - 1);
            await Haptics.selectionAsync();
        }
    }

    async function submitAdventure(values: CreateAdventureFormValues) {
        if(!isOnline) {
            Alert.alert("You're offline", "Reconnect before saving an adventure.");

            return;
        }

        const localPhotos = values.photos.map((photo) => typeof photo === "string" ? {
            uri: photo,
            fileName: null,
            mimeType: null
        } : photo);

        const uploadedImages: UploadedImage[] = [];

        try {
            setUploadProgress({
                completed: 0,
                total: localPhotos.length
            });

            for(let index = 0; index < localPhotos.length; index += 1) {
                const uploadedImage = await uploadImageRequest(localPhotos[index], index);

                uploadedImages.push(uploadedImage);

                setUploadProgress({
                    completed: index + 1,
                    total: localPhotos.length
                });
            }

            const payload: AdventureCreatePayload = {
                title: values.title.trim(),
                description: values.description.trim(),
                category: values.category,
                status: values.status,
    
                adventure_date: values.date,
                location_name: values.locationName.trim(),
    
                latitude: roundCoordinate(values.latitude),
                longitude: roundCoordinate(values.longitude),
    
                rating: values.rating,
                is_favorite: values.isFavorite,
    
                photos: uploadedImages.map((image) => ({
                    image_url: image.image_url,
                    public_id: image.public_id
                }))
            };

            await createAdventureMutation.mutateAsync(payload);

            setIsSaved(true);

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        catch (error) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            const message = error instanceof ApiError ? error.message : "AdventureLog could not save this adventure. Check your connection and try again.";

            Alert.alert("Adventure not saved", message);
        }
        finally {
            setUploadProgress(null);
        }
    }

    function roundCoordinate(value: number | null): number | null {
        if(value === null) {
            return null;
        }

        return Number(value.toFixed(6));
    }

    function startAnotherAdventure() {
        reset(CreateAdventureDefaultValues);
        setCurrentStep(1);
        setIsSaved(false);
    }

    if(isSaved) {
        return(
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <View style={styles.sucessActions}>
                    <Pressable
                        onPress={() => {
                            reset(CreateAdventureDefaultValues);
                            setCurrentStep(1);
                            setIsSaved(false);
                            router.navigate("/(tabs)/journal");
                        }}
                        style={({pressed}) => [styles.primaryButton, styles.successActionButton, pressed && styles.pressed]}
                    >
                        <Ionicons name="book-outline" size={19} color={colors.background} />

                        <Text style={styles.primaryButtonText}>
                            View in Journal
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={startAnotherAdventure}
                        style={({pressed}) => [styles.secondarySuccessButton, pressed && styles.pressed]}
                    >
                        <Ionicons name="add" size={19} color={colors.textPrimary} />

                        <Text style={styles.secondarySuccessButtonText}>
                            Log another
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={90}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.eyebrow}>
                            New memory
                        </Text>

                        <Text style={styles.title}>
                            Log an adventure
                        </Text>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Discard adventure"
                        onPress={() => {
                            Alert.alert("Discard this adventure?", "Everything entered in this form will be cleared.",
                            [
                                {
                                    text: "Keep editing",
                                    style: "cancel",
                                },
                                {
                                    text: "Discard",
                                    style: "destructive",
                                    onPress: () => {
                                        reset(CreateAdventureDefaultValues);
                                        setCurrentStep(1);
                                    }
                                }
                            ]);
                        }}
                        style={({pressed}) => [styles.closeButton, pressed && styles.pressed]}
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
                        <AdventurePlaceStep 
                            control={control} 
                            errors={errors} 
                            setValue={setValue}
                            latitude={latitude}
                            longitude={longitude}    
                        />
                    ): null}

                    {currentStep === 3 ? (
                        <AdventurePhotosStep 
                            photos={photos}
                            onChangePhotos={(nextPhotos) => setValue("photos", nextPhotos, {shouldDirty: true, shouldValidate: true})}
                        />
                    ): null}

                    {currentStep === 4 ? (
                        <AdventureReviewStep 
                            values={reviewValues}
                            onChangeRating={(rating) => setValue("rating", rating, {shouldDirty: true})}
                            onToggleFavorite={() => setValue("isFavorite", !getValues("isFavorite"), {shouldDirty: true})}
                        />
                    ): null}
                </ScrollView>

                <View style={styles.footer}>
                    {currentStep > 1 ? (
                        <Pressable 
                            onPress={() => void goBack()} 
                            style={({pressed}) => [styles.secondaryButton, pressed && styles.pressed]}
                        >
                            <Ionicons name="arrow-back" size={18} color={colors.textPrimary} />
                        </Pressable>
                    ): null}

                    {currentStep < TOTAL_STEPS ? (
                        <Pressable
                            onPress={() => void goForward()}
                            style={({pressed}) => [styles.primaryButton, currentStep === 1 && styles.fullWidthButton, pressed && styles.pressed]}
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
                                            Uploading photos
                                        </Text>

                                        <Text style={styles.uploadProgressDescription}>
                                            {uploadProgress.completed} of{" "}
                                            {uploadProgress.total} complete
                                        </Text>
                                    </View>
                                </View>
                            ): null}

                            <Pressable
                                disabled={isSaving}
                                onPress={handleSubmit(submitAdventure)}
                                style={({pressed}) => [styles.primaryButton, pressed && !isSaving && styles.pressed, isSaving && styles.buttonDisabled]}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color={colors.background} />
                                ): (
                                <>
                                    <Ionicons name="bookmark-outline" size={18} color={colors.background} />

                                    <Text style={styles.primaryButtonText}>
                                        Save adventure
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
            backgroundColor: colors.background,
        },
        keyboardView: {
            flex: 1,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
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
        closeButton: {
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 22,
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
            borderTopColor: colors.border,
        },
        primaryButton: {
            flex: 1,
            minHeight: 54,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            backgroundColor: colors.forest,
            borderRadius: 18,
        },
        fullWidthButton: {
            flex: 1
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
            borderRadius: 18,
        },
        secondaryButtonText: {
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: "800"
        },
        sucessActions: {
            alignSelf: "stretch",
            gap: spacing.md,
            marginTop: spacing.xl
        },
        successActionButton: {
            flex: 0
        },
        secondarySuccessButton: {
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
        secondarySuccessButtonText: {
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: "800"
        },
        successContainer: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: spacing.xl,
        },
        successIcon: {
            width: 76,
            height: 76,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.success,
            borderRadius: 28,
        },
        successEyebrow: {
            marginTop: spacing.xl,
            color: colors.clay,
            fontSize: 12,
            fontWeight: "800",
            letterSpacing: 1.1,
            textTransform: "uppercase"
        },
        successTitle: {
            marginTop: spacing.sm,
            color: colors.textPrimary,
            fontSize: 29,
            fontWeight: "800",
            textAlign: "center",
        },
        successDescription: {
            maxWidth: 320,
            marginTop: spacing.md,
            color: colors.textSecondary,
            fontSize: 15,
            lineHeight: 22,
            textAlign: "center",
        },
        successButton: {
            flex: 0,
            alignSelf: "stretch",
            marginTop: spacing.xl,
        },
        pressed: {
            opacity: 0.84
        },
        buttonDisabled: {
            opacity: 0.65
        },
        uploadProgressCard: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            marginBottom: spacing.md,
            padding: spacing.md,
            backgroundColor: colors.surfaceMuted,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16
        },
        uploadProgressText: {
            flex: 1
        },
        uploadProgressTitle: {
            color: colors.textPrimary,
            fontSize: 13,
            fontWeight: "800"
        },
        uploadProgressDescription: {
            marginTop: 3,
            color: colors.textSecondary,
            fontSize: 12,
        },
        finalStepActions: {
            flex: 1,
            // gap: spacing.md
        }
    });
}