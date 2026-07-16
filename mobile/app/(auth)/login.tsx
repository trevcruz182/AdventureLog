import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, View, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthTextField } from "@/components/auth/AuthTextField";
import { LoginFormValues, loginSchema } from "@/features/auth/authSchemas";
import { useAuth } from "@/features/auth/AuthProvider";
import { ApiError } from "@/lib/api/ApiError";
import { AppColors, spacing, useAppTheme } from "@/theme";

export default function LoginScreen() {
    const {colors} = useAppTheme();
    const {login} = useAuth();

    const styles = createStyles(colors);

    const {
        control,
        handleSubmit,
        setError,
        formState: {
            errors,
            isSubmitting,
        }
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            login: "",
            password: "",
        },
        mode: "onBlur"
    });

    async function submitLogin(values: LoginFormValues) {
        try {
            await login(values);

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        catch(error) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            const message = error instanceof ApiError ? error.message : "Unable to sign in. Check your connection and try again.";

            setError("root", {
                type: "server",
                message,
            });
        }
    }

    let passwordInputRef: TextInput | null = null;

    return(
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.content}
                >
                    <View style={styles.brandMark}>
                        <Ionicons name="compass-outline" size={30} color={colors.background} />
                    </View>

                    <Text style={styles.eyebrow}>
                        AdventureLog
                    </Text>

                    <Text style={styles.title}>
                        Welcome back.
                    </Text>

                    <Text style={styles.description}>
                        Sign in to revist your memories and keep building your personal map.
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
                        name="login"
                        render={({field: {value, onChange, onBlur, ref}}) => (
                            <AuthTextField 
                                ref={ref}
                                label="Email or username"
                                icon="person-outline"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.login?.message}
                                placeholder="name@example.com"
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="username"
                                autoComplete="username"
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
                                placeholder="Enter your password"
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="password"
                                autoComplete="password"
                                returnKeyType="done"
                                isPassword
                                secureTextEntry
                                onSubmitEditing={() => void handleSubmit(submitLogin)()}
                            />
                        )}
                    />

                    <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                            // Password reset will be added later.
                        }}
                        style={styles.forgotButton}
                    >
                        <Text style={styles.forgotText}>
                            Forgot password?
                        </Text>
                    </Pressable>

                    <Pressable
                        accessibilityRole="button"
                        disabled={isSubmitting}
                        onPress={handleSubmit(submitLogin)}
                        style={({pressed}) => [styles.primaryButton, pressed && styles.pressed, isSubmitting && styles.buttonDisabled]}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color={colors.background} />
                        ): (
                            <>
                                <Text style={styles.primaryButtonText}>
                                    Sign in
                                </Text>

                                <Ionicons name="arrow-forward" size={18} color={colors.background} />
                            </>
                        )}
                    </Pressable>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />

                        <Text style={styles.dividerText}>
                            New to AdventureLog?
                        </Text>

                        <View style={styles.dividerLine} />
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        disabled={isSubmitting}
                        onPress={() => router.push("/(auth)/register")}
                        style={({pressed}) => [styles.secondaryButton, pressed && styles.pressed]}
                    >
                        <Text style={styles.secondaryButtonText}>
                            Create an account
                        </Text>
                    </Pressable>

                    <Text style={styles.footerText}>
                        Every adventure leaves a mark.
                    </Text>
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
            flex: 1
        },
        content: {
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.xxl,
        },
        brandMark: {
            width: 64,
            height: 64,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.forest,
            borderRadius: 24
        },
        eyebrow: {
            marginTop: spacing.xl,
            color: colors.clay,
            fontSize: 12,
            fontWeight: "800",
            letterSpacing: 1.3,
            textTransform: "uppercase"
        },
        title: {
            marginTop: spacing.sm,
            color: colors.textPrimary,
            fontSize: 36,
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
            borderRadius: 16
        },
        serverErrorText: {
            flex: 1,
            color: colors.danger,
            fontSize: 13,
            fontWeight: "700",
            lineHeight: 18  
        },
        forgotButton: {
            alignSelf: "flex-end",
            marginTop: spacing.md,
            paddingVertical: spacing.xs
        },
        forgotText: {
            color: colors.forest,
            fontSize: 13,
            fontWeight: "800"
        },
        primaryButton: {
            minHeight: 56,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            marginTop: spacing.xl,
            backgroundColor: colors.forest,
            borderRadius: 18,
        },
        primaryButtonText: {
            color: colors.background,
            fontSize: 15,
            fontWeight: "800"
        },
        buttonDisabled: {
            opacity: 0.65,
        },
        divider: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            marginVertical: spacing.xl
        },
        dividerLine: {
            flex: 1,
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.border,
        },
        dividerText: {
            color: colors.textMuted,
            fontSize: 12,
            fontWeight: "700"
        },
        secondaryButton: {
            minHeight: 56,
            alignItems: "center",
            justifyContent: "center",
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
        footerText: {
            marginTop: spacing.xl,
            color: colors.textMuted,
            fontSize: 12,
            fontWeight: "600",
            textAlign: "center"
        },
        pressed: {
            opacity: 0.82
        },
    });
}