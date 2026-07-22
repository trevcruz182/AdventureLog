import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { listCollectionsRequest, createCollectionRequest, getCollectionRequest } from "@/lib/api/collections";
import type { CollectionCreatePayload, AdventureCollectionDetail } from "@/types/collection";
import { collectionQueryKeys } from "./collectionQueries";
import { addAdventureToCollectionRequest, removeAdventureFromCollectionRequest } from "@/lib/api/collections";

export function useCollections() {
    return useQuery({
        queryKey: collectionQueryKeys.list(),
        queryFn: listCollectionsRequest,
    });
}

export function useCollection(collectionId: string | undefined) {
    return useQuery<AdventureCollectionDetail>({
        queryKey: collectionQueryKeys.detail(collectionId ?? ""),
        queryFn: () => getCollectionRequest(collectionId as string),
        enabled: Boolean(collectionId),
    });
}

export function useCreateCollection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CollectionCreatePayload) => createCollectionRequest(payload),

        onSuccess: async (createCollection) => {
            queryClient.setQueryData(collectionQueryKeys.detail(createCollection.id), createCollection);

            await queryClient.invalidateQueries({
                queryKey: collectionQueryKeys.lists()
            });
        }
    });
}

export function useAddAdventureToCollection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({collectionId, adventureId}: {collectionId: string; adventureId: string}) => addAdventureToCollectionRequest(collectionId, adventureId),
        onSuccess: async (updatedCollection) => {
            queryClient.setQueryData(collectionQueryKeys.detail(updatedCollection.id), updatedCollection);

            await queryClient.invalidateQueries({queryKey: collectionQueryKeys.lists()})
        }
    });
}

export function useRemoveAdventureFromCollection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({collectionId, adventureId}: {collectionId: string; adventureId: string;}) => removeAdventureFromCollectionRequest(collectionId, adventureId),
        onSuccess: async (_, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: collectionQueryKeys.detail(variables.collectionId)
                }),
                queryClient.invalidateQueries({
                    queryKey: collectionQueryKeys.lists()
                })
            ]);
        }
    });
}