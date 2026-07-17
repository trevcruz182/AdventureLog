import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createAdventureRequest, listAdventuresRequest } from "@/lib/api/adventures";
import { adventureQueryKeys } from "./adventureQueries";

import type { AdventureCreatePayload, AdventureListParams } from "@/types/adventure";

export function useAdventures(params: AdventureListParams = {}) {
    return useQuery({
        queryKey: adventureQueryKeys.list(params),
        queryFn: () => listAdventuresRequest(params),
    });
}

export function useCreateAdventure() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AdventureCreatePayload) => createAdventureRequest(payload),

        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: adventureQueryKeys.lists()})
        }
    });
}