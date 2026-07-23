import * as SecureStore from "expo-secure-store";

import type { AuthUser } from "@/types/auth";

const CACHED_USER_KEY = "adventurelog.cached_user";

export async function saveCachedUser(user: AuthUser): Promise<void> {
    await SecureStore.setItemAsync(CACHED_USER_KEY, JSON.stringify(user));
}

export async function getCachedUser(): Promise<AuthUser | null> {
    const storedUser = await SecureStore.getItemAsync(CACHED_USER_KEY);

    if(!storedUser) {
        return null;
    }

    try {
        const parsedUser = JSON.parse(storedUser) as unknown;

        if(typeof parsedUser !== "object" || parsedUser === null ||
            !("id" in parsedUser) || !("email" in parsedUser) ||
            !("username" in parsedUser) || !("display_name" in parsedUser)
        ) {
            return null;
        } 

        return parsedUser as AuthUser;
    }
    catch {
        return null;
    }
}

export async function clearCachedUser(): Promise<void> {
    await SecureStore.deleteItemAsync(CACHED_USER_KEY);
}