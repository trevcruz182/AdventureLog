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
import { Adventure } from "@/types/adventure";
import { CreateAdventureDefaultValues, CreateAdventureFormValues, createAdventureSchema } from "@/features/adventures/createAdventureSchema";
import { ApiError } from "@/lib/api/ApiError";
import { AppColors, spacing, useAppTheme } from "@/theme";

const TOTAL_STEPS = 3;

const stepFields: Record<number, Array<keyof CreateAdventureFormValues>> = {
    1: [
        "title",
        "category",
        "description",
        "date"
    ],
    2: [
        "locationName",
        "latitude",
        "longitude"
    ],
    3: [
        "rating",
        "isFavorite"
    ]
};

function roundCoordinate(value: number | null): number | null {
    if(value === null) {
        return null;
    }

    return Number(value.toFixed(6));
}

export default function EditAdventureScreen() {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

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

    const reviewValues = useWatch({
        control
    }) as CreateAdventureFormValues;

    useEffect(() => {
        if(!adventure) {
            return;
        }

        reset({
            title: adventure.title,
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
        if(!adventureId) {
            return;
        }

        try {
            await updateMutation.mutateAsync({adventureId, payload: {
                title: values.title.trim(),
                description: values.description.trim(),
                category: values.category,
                adventure_date: values.date,
                location_name: values.locationName.trim(),
                latitude: roundCoordinate(values.latitude),
                longitude: roundCoordinate(values.longitude),
                rating: values.rating,
                is_favorite: values.isFavorite,
                // Photos omitted on purpose, the update does not change photos
            }
            });

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            router.back();
        }
        catch (error) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            const message = error instanceof ApiError ? error.message : "AdventureLog could not update this adventure.";

            Alert.alert("Adventure not updated", message);
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

    const isSaving = updateMutation.isPending;

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
                            style={({pressed}) => [styles.primaryButton, pressed && styles.pressed]}
                        >
                            <Text style={styles.primaryButtonText}>
                                Continue
                            </Text>

                            <Ionicons name="arrow-forward" size={18} color={colors.background} />
                        </Pressable>
                    ): (
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
        }
    });
}