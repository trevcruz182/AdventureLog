import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useColorScheme } from "react-native";

import { AppColors, darkColors, lightColors } from "./colors";
import { AppearancePreference, ResolvedAppearance } from "./types";

const APPEARANCE_STORAGE_KEY = "adventurelog.appearance";

type ThemeContextValue = {
    colors: AppColors;
    preference: AppearancePreference;
    resolvedAppearance: ResolvedAppearance;
    isDark: boolean;
    isReady: boolean;
    setPreference: (preference: AppearancePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({children}: PropsWithChildren) {
    const systemAppearance = useColorScheme();

    const [preference, setPreferenceState] = useState<AppearancePreference>("system");

    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function loadPreference() {
            try {
                const storedPreference = await AsyncStorage.getItem(APPEARANCE_STORAGE_KEY);

                if(storedPreference === "system" || storedPreference === "light" || storedPreference === "dark") {
                    setPreferenceState(storedPreference);
                }
            }
            catch (error) {
                console.warn("Unable to load apperance preference:", error);
            }
            finally {
                setIsReady(true);
            }
        }

        void loadPreference();
    }, []);

    const setPreference = useCallback(async (nextPreference: AppearancePreference) => {
        setPreferenceState(nextPreference);

        try {
            await AsyncStorage.setItem(APPEARANCE_STORAGE_KEY, nextPreference);
        }
        catch (error) {
            console.warn("Unable to save appearance preference:", error);
        }
    }, []);
    
    const resolvedAppearance: ResolvedAppearance = preference === "system" ? 
                                                        systemAppearance === "dark" ? "dark" : "light"
                                                    : preference;
    
    const colors = resolvedAppearance === "dark" ? darkColors : lightColors;

    const value = useMemo(() => ({
        colors,
        preference,
        resolvedAppearance,
        isDark: resolvedAppearance === "dark",
        isReady,
        setPreference,
    }), [colors, preference, resolvedAppearance, isReady, setPreference]);

    return(
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useAppTheme() {
    const context = useContext(ThemeContext);

    if(!context) {
        throw new Error("useAppTheme must be used inside ThemeProvider");
    }

    return context;
}