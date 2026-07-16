import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, View, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, TextInput } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthTextField } from "@/components/auth/AuthTextField";
import { RegisterFormValues, registerSchema } from "@/features/auth/authSchemas";
import { useAuth } from "@/features/auth/AuthProvider";
import { ApiError } from "@/lib/api/ApiError";
import { AppColors, spacing, useAppTheme } from "@/theme";

export default function RegisterScreen() {
    const {colors} = useAppTheme();
    const {register} = useAuth();

    const styles = createStyles(colors);

    const {
        control,
        handleSubmit,
        setError,
        formState: {
            errors,
            isSubmitting
        }
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            displayName: "",
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        mode: "onBlur"
    });

    async function submitRegistration(values: RegisterFormValues) {
        try {
            await register({
                display_name: values.displayName.trim(),
                username: values.username.trim().toLowerCase(),
                email: values.email.trim().toLowerCase(),
                password: values.password
            });

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        catch (error) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            const message = error instanceof ApiError ? error.message : "Unable to create your account. Check your connection and try again.";

            setError("root", {
                type: "server",
                message,
            });
        }
    }

    let usernameInputRef: TextInput | null = null;
    let emailInputRef: TextInput | null = null;
    let passwordInputRef: TextInput | null = null;
    let confirmPasswordInputRef: TextInput | null = null;

    return(
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.keyboardView}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.content}
                >
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Back to login"
                        onPress={() => router.back()}
                        style={({pressed}) => [styles.backButton, pressed && styles.pressed]}
                    >
                        <Ionicons name="arrow-back" size={21} color={colors.textPrimary} />
                    </Pressable>

                    <Text style={styles.eyebrow}>
                        Begin your trail
                    </Text>

                    <Text style={styles.title}>
                        Create your account.
                    </Text>

                    <Text style={styles.description}>
                        Start preserving the places and experiences you never want to forget.
                    </Text>

                    {errors.root?.message ? (
                        <View style={styles.serverError}>
                            <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />

                            <Text style={styles.serverErrorText}>
                                {errors.root.message}
                            </Text>
                        </View>
                    ): null}

                    <Controller 
                        control={control}
                        name="displayName"
                        render={({field: {value, onChange, onBlur, ref}}) => (
                            <AuthTextField 
                                ref={ref}
                                label="Name"  
                                icon="person-outline"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.displayName?.message}
                                placeholder="John Smith"
                                textContentType="name"
                                autoComplete="name"
                                returnKeyType="next"
                                onSubmitEditing={() => usernameInputRef?.focus()}
                            />
                        )}
                    />

                    <Controller 
                        control={control}
                        name="username"
                        render={({field: {value, onChange, onBlur, ref}}) => (
                            <AuthTextField 
                                ref={(input) => {
                                    ref(input);
                                    usernameInputRef = input;
                                }}
                                label="Username"  
                                icon="at-outline"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.username?.message}
                                placeholder="lost_wanderer"
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="username"
                                autoComplete="username-new"
                                returnKeyType="next"
                                onSubmitEditing={() => emailInputRef?.focus()}
                            />
                        )}
                    />

                    <Controller 
                        control={control}
                        name="email"
                        render={({field: {value, onChange, onBlur, ref}}) => (
                            <AuthTextField 
                                ref={(input) => {
                                    ref(input);
                                    emailInputRef = input;
                                }}
                                label="Email"  
                                icon="mail-outline"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.email?.message}
                                placeholder="johnsmith@example.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="emailAddress"
                                autoComplete="email"
                                returnKeyType="next"
                                onSubmitEditing={() => passwordInputRef?.focus()}
                            />
                        )}
                    />

                    <Controller 
                        control={control}
                        name="password"
                        render={({field: {value, onChange, onBlur, ref}}) => (
                            <AuthTextField 
                                ref={(input) => {
                                    ref(input);
                                    passwordInputRef = input;
                                }}
                                label="Password"  
                                icon="lock-closed-outline"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.password?.message}
                                placeholder="At least 8 characters"
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="newPassword"
                                autoComplete="new-password"
                                returnKeyType="next"
                                isPassword
                                secureTextEntry
                                onSubmitEditing={() => confirmPasswordInputRef?.focus()}
                            />
                        )}
                    />

                    <Text style={styles.passwordHint}>
                        Use at least eight characters with one letter and one number.
                    </Text>

                    <Controller 
                        control={control}
                        name="confirmPassword"
                        render={({field: {value, onChange, onBlur, ref}}) => (
                            <AuthTextField 
                                ref={(input) => {
                                    ref(input);
                                    confirmPasswordInputRef = input;
                                }}
                                label="Confirm password"  
                                icon="shield-checkmark-outline"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.confirmPassword?.message}
                                placeholder="Enter it once more"
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="newPassword"
                                autoComplete="new-password"
                                returnKeyType="done"
                                isPassword
                                secureTextEntry
                                onSubmitEditing={() => void handleSubmit(submitRegistration)()}
                            />
                        )}
                    />

                    <Text style={styles.termsText}>
                        By creating an account, you agree to AdventureLog's future Terms of Service and Privacy Policy.
                    </Text>

                    <Pressable
                        accessibilityRole="button"
                        disabled={isSubmitting}
                        onPress={handleSubmit(submitRegistration)}
                        style={({pressed}) => [styles.primaryButton, pressed && styles.pressed, isSubmitting && styles.buttonDisabled]}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color={colors.background} />
                        ): (
                            <>
                                <Text style={styles.primaryButtonText}>
                                    Create account
                                </Text>

                                <Ionicons name="arrow-forward" size={18} color={colors.background} />
                            </>
                        )}
                    </Pressable>

                    <View style={styles.loginRow}>
                        <Text style={styles.loginPrompt}>
                            Already have an account?
                        </Text>

                        <Pressable
                            disabled={isSubmitting}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.loginLink}>
                                Sign in
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
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
        content: {
            flexGrow: 1,
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.lg,
            paddingBottom: spacing.xxl,
        },
        backButton: {
            width: 46,
            height: 46,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.xl,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 23,
        },
        eyebrow: {
            color: colors.clay,
            fontSize: 12,
            fontWeight: "800",
            letterSpacing: 1.3,
            textTransform: "uppercase"
        },
        title: {
            marginTop: spacing.sm,
            color: colors.textPrimary,
            fontSize: 34,
            fontWeight: "800"
        },
        description: {
            marginTop: spacing.md,
            color: colors.textSecondary,
            fontSize: 15,
            lineHeight: 22,
        },
        serverError: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: spacing.sm,
            marginTop: spacing.xl,
            padding: spacing.md,
            backgroundColor: colors.surfaceMuted,
            borderWidth: 1,
            borderColor: colors.danger,
            borderRadius: 16,
        },
        serverErrorText: {
            flex: 1,
            color: colors.danger,
            fontSize: 13,
            fontWeight: "700",
            lineHeight: 18
        },
        passwordHint: {
            marginTop: spacing.sm,
            color: colors.textMuted,
            fontSize: 11,
            lineHeight: 16
        },
        termsText: {
            marginTop: spacing.xl,
            color: colors.textMuted,
            fontSize: 11,
            lineHeight: 17,
            textAlign: "center"
        },
        primaryButton: {
            minHeight: 56,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            marginTop: spacing.lg,
            backgroundColor: colors.forest,
            borderRadius: 18
        },
        primaryButtonText: {
            color: colors.background,
            fontSize: 15,
            fontWeight: "800"
        },
        buttonDisabled: {
            opacity: 0.65,
        },
        loginRow: {
            flexDirection: "row",
            justifyContent: "center",
            gap: 5,
            marginTop: spacing.xl,
        },
        loginPrompt: {
            color: colors.textSecondary,
            fontSize: 13
        },
        loginLink: {
            color: colors.forest,
            fontSize: 13,
            fontWeight: "800"
        },
        pressed: {
            opacity: 0.82,
        }
    });
}