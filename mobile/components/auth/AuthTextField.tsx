import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { AppColors, spacing, useAppTheme } from "@/theme";

type AuthTextFieldProps = TextInputProps & {
    label: string;
    error?: string;
    icon: React.ComponentProps<typeof Ionicons>["name"];
    isPassword?: boolean;
};

export const AuthTextField = forwardRef<TextInput, AuthTextFieldProps>(function AuthTextField({
    label,
    error,
    icon,
    isPassword = false,
    secureTextEntry,
    ...inputProps
}, ref) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const shouldHidePassword = isPassword && !isPasswordVisible && secureTextEntry !== false;

    return(
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>

            <View style={[styles.inputContainer, error && styles.inputContainerError]}>
                <Ionicons name={icon} size={19} color={error ? colors.danger : colors.textMuted} />

                <TextInput 
                    ref={ref}
                    secureTextEntry={shouldHidePassword}
                    placeholderTextColor={colors.textMuted}
                    selectionColor={colors.forest}
                    style={styles.input}
                    {...inputProps}
                />

                {isPassword ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
                        onPress={() => setIsPasswordVisible((visible) => !visible)}
                        hitSlop={8}
                    >
                        <Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textMuted} />
                    </Pressable>
                ): null}
            </View>

            {error ? (
                <Text style={styles.error} accessibilityRole="alert">
                    {error}
                </Text>
            ): null}
        </View>
    );
});

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        field: {
            marginTop: spacing.lg,
        },
        label: {
            marginBottom: spacing.sm,
            color: colors.textPrimary,
            fontSize: 13,
            fontWeight: "800"
        },
        inputContainer: {
            minHeight: 56,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 18,
        },
        inputContainerError: {
            borderColor: colors.danger
        },
        input: {
            flex: 1,
            minHeight: 54,
            color: colors.textPrimary,
            fontSize: 15,
        },
        error: {
            marginTop: spacing.sm,
            color: colors.danger,
            fontSize: 12,
            fontWeight: "700"
        }
    });
}