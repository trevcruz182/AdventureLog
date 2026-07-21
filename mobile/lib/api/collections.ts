import { apiRequest } from "./client";

import type { AdventureCollection, AdventureCollectionDetail, CollectionCreatePayload, CollectionUpdatePayload } from "@/types/collection";

export function listCollectionsRequest(): Promise<AdventureCollection[]> {
    return apiRequest<AdventureCollection[]>("/collections");
}

export function getCollectionRequest(collectionId: string): Promise<AdventureCollectionDetail> {
    return apiRequest<AdventureCollectionDetail>(`/collections/${collectionId}`);
}

export function createCollectionRequest(payload: CollectionCreatePayload): Promise<AdventureCollectionDetail> {
    return apiRequest<AdventureCollectionDetail>("/collections", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

export function updateCollectionRequest(collectionId: string, payload: CollectionUpdatePayload): Promise<AdventureCollectionDetail> {
    return apiRequest<AdventureCollectionDetail>(`/collections/${collectionId}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
    });
}

export function deleteCollectionRequest(collectionId: string): Promise<void> {
    return apiRequest<void>(`/collections/${collectionId}`, {
        method: "DELETE"
    });
}

export function addAdventureToCollectionRequest(collectionId: string, adventureId: string): Promise<AdventureCollectionDetail> {
    return apiRequest<AdventureCollectionDetail>(`/collections/${collectionId}/adventures/${adventureId}`, {
        method: "POST"
    });
}

export function removeAdventureFromCollectionRequest(collectionId: string, adventureId: string): Promise<void> {
    return apiRequest<void>(`/collections/${collectionId}/adventures/${adventureId}`, {
        method: "DELETE"
    });
}