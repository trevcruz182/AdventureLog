import { apiRequest } from "./client";

import type { Adventure, AdventureCreatePayload, AdventureListParams, AdventureListResponse } from "@/types/adventure";

function buildAdventureQuery(params: AdventureListParams): string {
    const query = new URLSearchParams();

    if(params.category) {
        query.set("category", params.category);
    }

    if(params.status) {
        query.set("status", params.status);
    }

    if(params.isFavorite !== undefined) {
        query.set("is_favorite", String(params.isFavorite));
    }

    if(params.search?.trim()) {
        query.set("search", params.search.trim());
    }

    query.set("offset", String(params.offset ?? 0));

    query.set("limit", String(params.limit ?? 50));

    const queryString = query.toString();

    return queryString ? `/adventures?${queryString}` : "/adventures"
}

export function listAdventuresRequest(params: AdventureListParams): Promise<AdventureListResponse> {
    return apiRequest<AdventureListResponse>(buildAdventureQuery(params));
}

export function createAdventureRequest(payload: AdventureCreatePayload): Promise<Adventure> {
    return apiRequest<Adventure>("/adventures", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

export function getAdventureRequest(adventureId: string): Promise<Adventure> {
    return apiRequest<Adventure>(`/adventures/${adventureId}`);
}