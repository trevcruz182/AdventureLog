import { ApiError } from "./ApiError";
import { API_URL } from "./config";
import { refreshRequest } from "./auth";
import { getApiErrorMessage } from "./errorMessage";

import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "../auth/tokenStorage";

type ApiRequestOptions = RequestInit & {
    requiresAuth?: boolean;
    retryOnUnauthorized?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

async function parseReponse(response: Response): Promise<unknown> {
    const text = await response.text();

    if(!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    }
    catch {
        return text;
    }
}

async function refreshAccessToken(): Promise<string | null> {
    if(refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        const refreshToken = await getRefreshToken();

        if(!refreshToken) {
            return null;
        }

        try {
            const tokens = await refreshRequest(refreshToken);

            await saveTokens(tokens);

            return tokens.access_token;
        }
        catch (error) {
            if(error instanceof ApiError && error.status === 401) {
                await clearTokens();
            }
            
            return null;
        }
        finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const {
        requiresAuth = true,
        retryOnUnauthorized = true,
        headers,
        ...requestOptions
    } = options;

    const requestHeaders = new Headers(headers);

    const isFormData = typeof FormData !== "undefined" && requestOptions.body instanceof FormData;

    if(requestOptions.body && !isFormData && !requestHeaders.has("Content-Type")) {
        requestHeaders.set("Content-Type", "application/json");
    }

    if(requiresAuth) {
        const accessToken = await getAccessToken();

        if(accessToken) {
            requestHeaders.set("Authorization", `Bearer ${accessToken}`)
        }
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...requestOptions,
        headers: requestHeaders
    });

    if(response.status === 401 && requiresAuth && retryOnUnauthorized) {
        const refreshedAccessToken = await refreshAccessToken();

        if(refreshedAccessToken) {
            return apiRequest<T>(path, {
                ...options,
                retryOnUnauthorized: false,
            });
        }
    }

    const data = await parseReponse(response);

    if(!response.ok) {
        throw new ApiError(getApiErrorMessage(data, "This request could not be completed."), response.status, data);
    }

    return data as T;
}