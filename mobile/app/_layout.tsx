import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { SessionLoadingScreen } from "@/components/auth/SessionLoadingScreen";
import { AuthProvider, useAuth } from "@/features/auth/AuthProvider";
import { ThemeProvider, useAppTheme } from "@/theme";

function RootNavigator() {
  const {colors, isDark} = useAppTheme();
  const {isAuthenticated, isLoading} = useAuth();

  if(isLoading) {
    return <SessionLoadingScreen />;
  }

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
      >
        <Stack.Screen name="index" />

        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return(
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}