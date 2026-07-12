import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { useAppTheme } from "@/theme";

export default function TabsLayout() {
    const {colors} = useAppTheme();

    return(
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.forest,
                tabBarInactiveTintColor: colors.textMuted,
                sceneStyle: {
                    backgroundColor: colors.background,
                },
                tabBarStyle: {
                    height: 86,
                    paddingTop: 8,
                    paddingBottom: 18,
                    backgroundColor: colors.tabBar,
                    borderTopColor: colors.border,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                }
            }}
        >
            <Tabs.Screen 
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name="compass-outline" color={color} size={size} />
                    )
                }}
            />

            <Tabs.Screen 
                name="map"
                options={{
                    title: "Map",
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name="map-outline" color={color} size={size} />
                    )
                }}
            />

            <Tabs.Screen 
                name="create"
                options={{
                    title: "Log",
                    tabBarIcon: ({color}) => (
                        <Ionicons name="add-circle" color={color} size={32} />
                    )
                }}
            />

            <Tabs.Screen 
                name="journal"
                options={{
                    title: "Journal",
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name="book-outline" color={color} size={size} />
                    )
                }}
            />

            <Tabs.Screen 
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name="person-outline" color={color} size={size} />
                    )
                }}
            />
        </Tabs>
    );
}