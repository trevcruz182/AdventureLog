import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { loginRequest, registerRequest } from "@/lib/api/auth";
import { getCurrentUserRequest } from "@/lib/api/users";
import { clearTokens, getRefreshToken, saveTokens, getAccessToken } from "@/lib/auth/tokenStorage";
import { refreshRequest } from "@/lib/api/auth";
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
    const [user, setUser] = useState<AuthUser | null>(null);

    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        const currentUser = await getCurrentUserRequest();

        setUser(currentUser);
    }, []);

    const logout = useCallback(async () => {
        await clearTokens();
        setUser(null);
    }, []);

    const restoreSession = useCallback(async () => {
        try {
            const [accessToken, refreshToken] = await Promise.all([
                getAccessToken(),
                getRefreshToken(),
            ]);

            console.log("Stored access token:", Boolean(accessToken));
            console.log("Stored refresh token:", Boolean(refreshToken));

            if(!accessToken && !refreshToken) {
                setUser(null);
                return;
            }

            const currentuser = await getCurrentUserRequest();

            setUser(currentuser);
        }
        catch (error) {
            if(error instanceof ApiError && error.status === 401) {
                await clearTokens();
            }

            setUser(null);
        }
        finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void restoreSession();
    }, [restoreSession]);

    const login = useCallback(async ({login, password}: LoginPayload) => {
        const tokens = await loginRequest(login, password);

        await saveTokens(tokens);

        const savedRefreshToken = await getRefreshToken();

        console.log("Refresh token saved: ", Boolean(savedRefreshToken));

        try {
            const currentUser = await getCurrentUserRequest();

            setUser(currentUser);
        }
        catch (error) {
            await clearTokens();
            throw error;
        }
    }, []);

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