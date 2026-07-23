import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useNetworkStatus } from "../network/NetworkProvider";
import { clearCachedUser, getCachedUser, saveCachedUser } from "@/lib/auth/cachedUserStorage";
import { clearPersistedQueryCache } from "@/lib/query/persistence";
import { loginRequest, registerRequest } from "@/lib/api/auth";
import { getCurrentUserRequest } from "@/lib/api/users";
import { clearTokens, getRefreshToken, saveTokens, getAccessToken } from "@/lib/auth/tokenStorage";
import type { AuthUser, LoginPayload, RegisterPayload } from "@/types/auth";
import { ApiError } from "@/lib/api/ApiError";

type AuthContextValue = {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (payload: LoginPayload) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({children}: PropsWithChildren) {
    const queryClient = useQueryClient();

    const {isOnline, isReady: isNetworkReady} = useNetworkStatus();
    const [user, setUser] = useState<AuthUser | null>(null);

    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        const currentUser = await getCurrentUserRequest();

        setUser(currentUser);

        await saveCachedUser(currentUser);
    }, []);

    const clearLocalSession = useCallback(async () => {
        queryClient.clear();

        await Promise.all([clearTokens(), clearCachedUser(), clearPersistedQueryCache()]);

        setUser(null);
    }, [queryClient]);

    const logout = useCallback(async () => {
        await clearLocalSession();
    }, [clearLocalSession]);

    const restoreSession = useCallback(async () => {
        try {
            const [accessToken, refreshToken] = await Promise.all([
                getAccessToken(),
                getRefreshToken(),
            ]);

            if(!accessToken && !refreshToken) {
                await clearCachedUser();
                setUser(null);
                return;
            }

            if(!isOnline) {
                const cachedUser = await getCachedUser();

                setUser(cachedUser);
                return;
            }

            try {
                const currentuser = await getCurrentUserRequest();
                setUser(currentuser);

                await saveCachedUser(currentuser);
            }
            catch (error) {
                if(error instanceof ApiError && error.status === 401) {
                    await clearLocalSession();
                    return;
                }

                const cachedUser = await getCachedUser();

                setUser(cachedUser);
            }
        }
        finally {
            setIsLoading(false);
        }
    }, [isOnline, clearLocalSession]);

    useEffect(() => {
        if(!isNetworkReady) {
            return;
        }

        void restoreSession();
    }, [isNetworkReady, restoreSession]);

    const login = useCallback(async ({login: loginValue, password}: LoginPayload) => {
        queryClient.clear();

        await clearPersistedQueryCache();
        
        const tokens = await loginRequest(loginValue, password);

        await saveTokens(tokens);

        try {
            const currentUser = await getCurrentUserRequest();

            setUser(currentUser);

            await saveCachedUser(currentUser);
        }
        catch (error) {
            await clearLocalSession();
            throw error;
        }
    }, [queryClient, clearLocalSession]);

    const register = useCallback(async (payload: RegisterPayload) => {
        await registerRequest(payload);

        await login({
            login: payload.email,
            password: payload.password
        });
    }, [login]);

    const value = useMemo(() => ({
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
    }), [user, isLoading, login, register, logout, refreshUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if(!context) {
        throw new Error("useAuth must be used inside AuthProvider.");
    }

    return context;
}