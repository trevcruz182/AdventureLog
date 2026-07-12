export const sharedColors = {
    forest: "#294C3A",
    forestLight: "#557661",
    moss: "#7E8F62",
    clay: "#B96F4A",
    sky: "#6E96A3",
    sand: "#D5C19D",

    success: "#477557",
    warning: "B78138",
    danger: "#A95245",

    white: "#FFFFFF",
    black: "#111713",
} as const;

export const lightColors = {
    ...sharedColors,

    background: "#F4F1E8",
    surface: "#FFFCF5",
    surfaceMuted: "#E9E4D8",
    surfaceElevated: "#FFFFFF",

    textPrimary: "#25312A",
    textSecondary: "#667067",
    textMuted: "#8B938B",

    border: "#DDD7C9",
    tabBar: "#FFFCF5",
    overlay: "rgba(17, 23, 19, 0.45)"
} as const;

export const darkColors = {
    ...sharedColors,

    background: "#151A16",
    surface: "#1D241F",
    surfaceMuted: "#283029",
    surfaceElevated: "#242C26",

    textPrimary: "#F3EFE4",
    textSecondary: "#B7BDB6",
    textMuted: "#89928B",

    border: "#353E7",
    tabBar: "#1B221D",
    overlay: "rgba(4, 7, 5, 0.68)",

    forest: "#83A58D",
    forestLight: "#A1B9A7",
    moss: "#A2B27F",
    clay: "#D58A65",
    sky: "#88ABB5",
    sand: "#D6C39F",

    success: "#72A781",
    warning: "#D09A50",
    danger: "#CF7669",
} as const;

export type AppColors = {[Key in keyof typeof lightColors]: string;};