import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { ThemeProvider, useAppTheme } from "@/theme";

function RootNavigator() {
  const {colors, isDark} = useAppTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />

      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          }
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return(
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}