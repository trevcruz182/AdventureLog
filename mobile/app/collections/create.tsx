import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";

import { collectionDefaultValues, collectionIcons, collectionSchema, CollectionFormValues } from "@/features/collections/collectionSchema";
import { useCreateCollection } from "@/features/collections/useCollections";
import { ApiError } from "@/lib/api/ApiError";
import { AppColors, spacing, useAppTheme } from "@/theme";

const iconLabels = {
    "map-outline": "Places",
    "leaf-outline": "Nature",
    "snow-outline": "Winter",
    "restaurant-outline": "Food",
    "trophy-outline": "Sports",
    "airplane-outline": "Travel",
    "camera-outline": "Photos",
    "compass-outline": "Explore",
} as const;

export default function CreateCollectionScreen() {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const createMutation = useCreateCollection();

    const {
        control,
        formState: {
            errors,
            isDirty
        },
        handleSubmit,
        watch,
        setValue
    } = useForm<CollectionFormValues>({
        resolver: zodResolver(collectionSchema),
        defaultValues: collectionDefaultValues,
        mode: "onBlur"
    });

    const selectedIcon = watch("icon");
    const targetCount = watch("targetCount");

    function cancelCreation() {
        if(!isDirty) {
            router.back();
            return;
        }

        Alert.alert("Discard this collection?", "Your collection has not been saved.", [
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

    async function submitCollection(values: CollectionFormValues) {
        try {
            await createMutation.mutateAsync({
                title: values.title.trim(),
                description: values.description.trim(),
                icon: values.icon,
                target_count: values.targetCount
            });

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            router.back();
        }
        catch (error) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            const message = error instanceof ApiError ? error.message : "AdventureLog could not create this collection.";

            Alert.alert("Collection not created", message);
        }
    }

    const isSaving = createMutation.isPending;

    return(
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.eyebrow}>
                            New goal
                        </Text>

                        <Text style={styles.title}>
                            Create collection
                        </Text>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Cancel"
                        disabled={isSaving}
                        onPress={cancelCreation}
                        style={({pressed}) => [styles.headerButton, pressed && styles.pressed, isSaving && styles.disabled]}
                    >
                        <Ionicons name="close" size={22} color={colors.textPrimary} />
                    </Pressable>
                </View>

                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.content}
                >
                    <View style={styles.preview}>
                        <View style={styles.previewIcon}>
                            <Ionicons name={selectedIcon} size={31} color={colors.clay} />
                        </View>

                        <Text style={styles.previewLabel}>
                            New collection
                        </Text>

                        <Text style={styles.previewTarget}>
                            Goal: {targetCount} adventures
                        </Text>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>
                            Collection title
                        </Text>

                        <Controller 
                            control={control}
                            name="title"
                            render={({field: {value, onChange, onBlur}}) => (
                                <TextInput 
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    editable={!isSaving}
                                    placeholder="Rinks Visited"
                                    placeholderTextColor={colors.textMuted}
                                    maxLength={60}
                                    returnKeyType="next"
                                    style={[styles.input, errors.title && styles.inputError]}
                                />
                            )}
                        />

                        {errors.title ? (
                            <Text style={styles.errorText}>
                                {errors.title.message}
                            </Text>
                        ): null}
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>
                            Description
                        </Text>

                        <Controller 
                            control={control}
                            name="description"
                            render={({field: {value, onChange, onBlur}}) => (
                                <TextInput 
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    editable={!isSaving}
                                    placeholder="What connects these adventures?"
                                    placeholderTextColor={colors.textMuted}
                                    multiline
                                    maxLength={300}
                                    textAlignVertical="top"
                                    style={[styles.input, styles.descriptionInput, errors.description && styles.inputError]}
                                />
                            )}
                        />

                        <Text style={styles.helperText}>
                            Optional
                        </Text>

                        {errors.description ? (
                            <Text style={styles.errorText}>
                                {errors.description.message}
                            </Text>
                        ): null}
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>
                            Choose an icon
                        </Text>

                        <View style={styles.iconGrid}>
                            {collectionIcons.map((icon) => {
                                const isSelected = selectedIcon === icon;

                                return(
                                    <Pressable
                                        key={icon}
                                        disabled={isSaving}
                                        onPress={() => {
                                            setValue("icon", icon, {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            });

                                            void Haptics.selectionAsync();
                                        }}
                                        style={({pressed}) => [styles.iconOption, isSelected && styles.iconOptionSelected, pressed && styles.pressed]}
                                    >
                                        <Ionicons name={icon} size={23} color={isSelected ? colors.background : colors.textPrimary} />

                                        <Text style={[styles.iconLabel, isSelected && styles.iconLabelSelected]}>
                                            {iconLabels[icon]}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>
                            Adventure goal
                        </Text>

                        <Text style={styles.fieldDescription}>
                            Choose how many adventures you want this collection to contain.
                        </Text>

                        <View style={styles.targetSelector}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Decrease target"
                                disabled={isSaving || targetCount <= 1}
                                onPress={() => {
                                    setValue("targetCount", Math.max(1, targetCount - 1), {
                                        shouldDirty: true, 
                                    });

                                    void Haptics.selectionAsync();
                                }}
                                style={({pressed}) => [styles.targetButton, pressed && styles.pressed, targetCount <= 1 && styles.disabled]}
                            >
                                <Ionicons name="remove" size={22} color={colors.textPrimary} />
                            </Pressable>

                            <View style={styles.targetValue}>
                                <Text style={styles.targetNumber}>
                                    {targetCount}
                                </Text>

                                <Text style={styles.targetCaption}>
                                    adventures
                                </Text>
                            </View>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Increase target"
                                disabled={isSaving || targetCount >= 100}
                                onPress={() => {
                                    setValue("targetCount", Math.min(100, targetCount + 1), {
                                        shouldDirty: true
                                    });

                                    void Haptics.selectionAsync();
                                }}
                                style={({pressed}) => [styles.targetButton, pressed && styles.pressed, targetCount >= 100 && styles.disabled]}
                            >
                                <Ionicons name="add" size={22} color={colors.textPrimary} />
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Pressable
                        accessibilityRole="button"
                        disabled={isSaving}
                        onPress={handleSubmit(submitCollection)}
                        style={({pressed}) => [styles.saveButton, pressed && !isSaving && styles.pressed, isSaving && styles.disabled]}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color={colors.background} />
                        ): (
                            <>
                                <Ionicons name="albums-outline" size={19} color={colors.background} />

                                <Text style={styles.saveButtonText}>
                                    Create collection
                                </Text>
                            </>
                        )}
                    </Pressable>
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
            flex: 1
        },
        header: {
            minHeight: 72,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: spacing.lg,
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
            fontSize: 26,
            fontWeight: "800"
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
        content: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.xxl,
        },
        preview: {
            alignItems: "center",
            padding: spacing.xl,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 24,
        },
        previewIcon: {
            width: 62,
            height: 62,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surface,
            borderRadius: 22,
        },
        previewLabel: {
            marginTop: spacing.md,
            color: colors.textPrimary,
            fontSize: 17,
            fontWeight: "800"
        },
        previewTarget: {
            marginTop: 4,
            color: colors.textSecondary,
            fontSize: 13,
            fontWeight: "600"
        },
        fieldGroup: {
            marginTop: spacing.xl,
        },
        label: {
            marginBottom: spacing.sm,
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: "800"
        },
        fieldDescription: {
            marginBottom: spacing.md,
            color: colors.textSecondary,
            fontSize: 13,
            lineHeight: 19
        },
        input: {
            minHeight: 54,
            paddingHorizontal: spacing.lg,
            color: colors.textPrimary,
            fontSize: 15,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 18
        },
        descriptionInput: {
            minHeight: 120,
            paddingTop: spacing.lg,
            paddingBottom: spacing.lg,
        },
        inputError: {
            borderColor: colors.danger
        },
        helperText: {
            marginTop: spacing.sm,
            color: colors.textMuted,
            fontSize: 12
        },
        errorText: {
            marginTop: spacing.sm,
            color: colors.danger,
            fontSize: 12,
            fontWeight: "600"
        },
        iconGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
        },
        iconOption: {
            width: "48%",
            minHeight: 72,
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 18
        },
        iconOptionSelected: {
            backgroundColor: colors.forest,
            borderColor: colors.forest
        },
        iconLabel: {
            color: colors.textSecondary,
            fontSize: 11,
            fontWeight: "700"
        },
        iconLabelSelected: {
            color: colors.background
        },
        targetSelector: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.xl,
            padding: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 22,
        },
        targetButton: {
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 18,
        },
        targetValue: {
            minWidth: 90,
            alignItems: "center"
        },
        targetNumber: {
            color: colors.textPrimary,
            fontSize: 29,
            fontWeight: "800"
        },
        targetCaption: {
            marginTop: 2,
            color: colors.textMuted,
            fontSize: 11,
            fontWeight: "700"
        },
        footer: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.lg,
            backgroundColor: colors.background,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
        },
        saveButton: {
            minHeight: 54,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            backgroundColor: colors.forest,
            borderRadius: 18,
        },
        saveButtonText: {
            color: colors.background,
            fontSize: 14,
            fontWeight: "800"
        },
        pressed: {
            opacity: 0.78,
        },
        disabled: {
            opacity: 0.5
        }
    });
}