import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { listCollectionsRequest, createCollectionRequest } from "@/lib/api/collections";
import type { CollectionCreatePayload } from "@/types/collection";
import { collectionQueryKeys } from "./collectionQueries";

export function useCollections() {
    return useQuery({
        queryKey: collectionQueryKeys.list(),
        queryFn: listCollectionsRequest,
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