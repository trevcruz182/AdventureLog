import { Ionicons } from "@expo/vector-icons";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { FieldError } from "./FieldError";

import { adventureCategories, CreateAdventureFormValues } from "@/features/adventures/createAdventureSchema";
import { AppColors, spacing, useAppTheme } from "@/theme";

type AdventureBasicsStepProps = {
    control: Control<CreateAdventureFormValues>;
    errors: FieldErrors<CreateAdventureFormValues>;
};

const categoryOptions: Array<{
    value: (typeof adventureCategories)[number];
    label: string;
    icon: React.ComponentProps<typeof Ionicons>["name"];
}> = [
    {
        value: "hiking",
        label: "Hiking",
        icon: "trail-sign-outline",
      },
      {
        value: "sports",
        label: "Sports",
        icon: "trophy-outline",
      },
      {
        value: "travel",
        label: "Travel",
        icon: "airplane-outline",
      },
      {
        value: "food",
        label: "Food",
        icon: "restaurant-outline",
      },
      {
        value: "outdoors",
        label: "Outdoors",
        icon: "leaf-outline",
      },
];

export function AdventureBasicsStep({control, errors}: AdventureBasicsStepProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    return(
        <View>
            <Text style={styles.heading}>Tell the story.</Text>

            <Text style={styles.description}>
                Start with the details that make this memory easy to recognize later.
            </Text>

            <View style={styles.field}>
                <Text style={styles.label}>Adventure title</Text>

                <Controller 
                    control={control}
                    name="title"
                    render={({field: {value, onChange, onBlur}}) => (
                        <TextInput
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            placeholder="Sunset at..."
                            placeholderTextColor={colors.textMuted}
                            maxLength={80}
                            returnKeyType="next"
                            style={styles.input}
                        />
                    )}
                />

                <FieldError message={errors.title?.message} />
            </View>

            <View  style={styles.field}>
                <Text style={styles.label}>Category</Text>

                <Controller 
                    control={control}
                    name="category"
                    render={({field: {value, onChange}}) => (
                        <View style={styles.categoryGrid}>
                            {categoryOptions.map((category) => {
                                const isSelected = value === category.value;

                                return(
                                    <Pressable
                                        key={category.value}
                                        onPress={() => onChange(category.value)}
                                        style={({pressed}) => [styles.categoryOption, isSelected && styles.categoryOptionSelected, pressed && styles.pressed]}
                                    >
                                        <Ionicons name={category.icon} size={21} color={isSelected ? colors.background : colors.forest} />

                                        <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}>
                                            {category.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}
                />

                <FieldError message={errors.category?.message} />
            </View>

            <View style={styles.field}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>Memory</Text>
                    <Text style={styles.optional}>Optional</Text>
                </View>

                <Controller 
                    control={control}
                    name="description"
                    render={({field: {value, onChange, onBlur}}) => (
                        <>
                            <TextInput 
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                placeholder="What made this adventure worth remembering?"
                                placeholderTextColor={colors.textMuted}
                                multiline
                                maxLength={600}
                                textAlignVertical="top"
                                style={[styles.input, styles.textArea]}
                            />

                            <Text style={styles.characterCount}>
                                {value.length}/600
                            </Text>
                        </>
                    )}
                />

                <FieldError message={errors.description?.message} />
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Date</Text>

                <Controller 
                    control={control}
                    name="date"
                    render={({field: {value, onChange, onBlur}}) => (
                        <View style={styles.iconInput}>
                            <Ionicons name="calendar-outline" size={19} color={colors.textMuted} />

                            <TextInput 
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={colors.textMuted}
                                autoCapitalize="none"
                                style={styles.iconTextInput}
                            />
                        </View>
                    )}
                />

                <FieldError message={errors.date?.message} />
            </View>
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
        field: {
            marginTop: spacing.xl,
        },
        labelRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
        },
        label: {
            marginBottom: spacing.sm,
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: "800"
        },
        optional: {
            marginBottom: spacing.sm,
            color: colors.textMuted,
            fontSize: 12,
            fontWeight: "600",
        },
        input: {
            minHeight: 54,
            paddingHorizontal: spacing.lg,
            color: colors.textPrimary,
            fontSize: 15,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 18,
        },
        textArea: {
            minHeight: 132,
            paddingTop: spacing.lg,
            paddingBottom: spacing.xl,
        },
        characterCount: {
            position: "absolute",
            right: spacing.md,
            bottom: spacing.sm,
            color: colors.textMuted,
            fontSize: 11,
            fontWeight: "600"
        },
        categoryGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
        },
        categoryOption: {
            width: "31%",
            minHeight: 82,
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 18,
        },
        categoryOptionSelected: {
            backgroundColor: colors.forest,
            borderColor: colors.forest,
        },
        categoryLabel: {
            color: colors.textSecondary,
            fontSize: 12,
            fontWeight: "700",
        },
        categoryLabelSelected: {
            color: colors.background,
        },
        iconInput: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            minHeight: 54,
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 18,
        },
        iconTextInput: {
            flex: 1,
            color: colors.textPrimary,
            fontSize: 15,
        },
        pressed: {
            opacity: 0.82,
        }
    });
}