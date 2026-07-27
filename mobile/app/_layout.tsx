import { Stack } from "expo-router";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { QueryProvider } from "@/lib/query/QueryProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { SessionLoadingScreen } from "@/components/auth/SessionLoadingScreen";
import { useNotificationNavigation } from "@/lib/notifications/useNotificationNavigation";
import { AuthProvider, useAuth } from "@/features/auth/AuthProvider";
import { NetworkProvider } from "@/features/network/NetworkProvider";
import { OfflineBanner } from "@/components/network/OfflineBanner";
import { ThemeProvider, useAppTheme } from "@/theme";
import "@/lib/notifications/adventureReminders";

function RootNavigator() {
  const {colors, isDark} = useAppTheme();
  const {isAuthenticated, isLoading} = useAuth();

  useNotificationNavigation(!isLoading && isAuthenticated);

  if(isLoading) {
    return <SessionLoadingScreen />;
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={{flex: 1}}>
        <OfflineBanner />
        
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

            <Stack.Screen 
              name="achievements/index"
              options={{
                presentation: "card",
                animation: "slide_from_right"
              }}
            />

            <Stack.Screen 
              name="adventures/[adventureId]"
              options={{
                presentation: "card",
                animation: "slide_from_right"
              }}
            />

            <Stack.Screen 
              name="adventures/edit"
              options={{
                presentation: "card",
                animation: "slide_from_right"
              }}
            />

            <Stack.Screen 
              name="collections/index"
              options={{
                presentation: "card",
                animation: "slide_from_right"
              }}
            />

            <Stack.Screen 
              name="collections/create"
              options={{
                presentation: "card",
                animation: "slide_from_bottom"
              }}
            />

            <Stack.Screen 
              name="collections/[collectionId]"
              options={{
                presentation: "card",
                animation: "slide_from_right"
              }}
            />

            <Stack.Screen 
              name="collections/manage"
              options={{
                presentation: "card",
                animation: "slide_from_bottom"
              }}
            />

            <Stack.Screen 
              name="collections/edit"
              options={{
                presentation: "card",
                animation: "slide_from_bottom"
              }}
            />
          </Stack.Protected>
        </Stack>
      </View>
    </>
  );
}

export default function RootLayout() {
  return(
    <GestureHandlerRootView style={{flex: 1}}>
      <ThemeProvider>
        <QueryProvider>
          <NetworkProvider>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </NetworkProvider>
        </QueryProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}