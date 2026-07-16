import { API_URL } from "./config";
import { ApiError } from "./ApiError";
import { getApiErrorMessage } from "./errorMessage";

import type { AuthUser, RegisterPayload, TokenPair } from "@/types/auth";

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

export async function registerRequest(payload: RegisterPayload): Promise<AuthUser> {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const data = await parseReponse(response);

    if(!response.ok) {
        throw new ApiError(getApiErrorMessage(data), response.status, data);
    }

    return data as AuthUser;
}

export async function loginRequest(login: string, password: string): Promise<TokenPair> {
    const body = new URLSearchParams();

    body.append("username", login);
    body.append("password", password);

    const response = await fetch(`${API_URL}/auth/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body.toString()
    });

    const data = await parseReponse(response);

    if(!response.ok) {
        throw new ApiError(getApiErrorMessage(data), response.status, data);
    }

    return data as TokenPair;
}

export async function refreshRequest(refreshToken: string): Promise<TokenPair> {
    const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            refreshToken: refreshToken
        })
    });

    const data = await parseReponse(response);

    if(!response.ok) {
        throw new ApiError(getApiErrorMessage(data), response.status, data);
    }

    return data as TokenPair;
}