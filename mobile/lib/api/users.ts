import { apiRequest } from "./client";

import type { AuthUser } from "@/types/auth";

export function getCurrentUserRequest(): Promise<AuthUser> {
    return apiRequest<AuthUser>("/users/me");
}