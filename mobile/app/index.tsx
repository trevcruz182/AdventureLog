import { Redirect } from "expo-router";

import { useAuth } from "@/features/auth/AuthProvider";

export default function IndexScreen() {
  const {isAuthenticated} = useAuth();

  return (<Redirect href={isAuthenticated ? "/(tabs)" : "/(auth)/login"} />);
}