import {z} from "zod";

export const loginSchema = z.object({
    login: z.string().trim().min(1, "Enter your email or username."),

    password: z.string().min(1, "Enter your password.")
});

export const registerSchema = z.object({
    displayName: z.string().trim().min(1, "Enter your name.").max(80, "Keep your name under 80 characters."),

    username: z.string().trim().min(3, "Username must be at least 3 characters.").max(30, "Keep your username under 30 characters.").regex(/^[a-zA-Z0-9_]+$/, "Use only letters, numbers, and underscores."),

    email: z.email("Enter a valid email address."),

    password: z.string().min(8, "Password must be at least 8 characters.").max(128, "Password is too long").refine((value) => /[A-Za-z]/.test(value), "Password myst contain at least one letter.").refine((value) => /\d/.test(value), "Password must contain at least one number."),

    confirmPassword: z.string().min(1, "Confirm your password.")
})
.refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match."
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export type RegisterFormValues = z.infer<typeof registerSchema>