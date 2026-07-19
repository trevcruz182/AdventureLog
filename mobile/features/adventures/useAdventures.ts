import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createAdventureRequest, listAdventuresRequest, deleteAdventureRequest, getAdventureRequest, updateAdventureRequest } from "@/lib/api/adventures";
import { adventureQueryKeys } from "./adventureQueries";
import type { AdventureUpdatePayload } from "@/lib/api/adventures";

import type { AdventureCreatePayload, AdventureListParams, Adventure } from "@/types/adventure";

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

export function useAdventure(adventureId: string | undefined) {
    return useQuery<Adventure>({
        queryKey: adventureQueryKeys.detail(adventureId ?? ""),
        queryFn: () => getAdventureRequest(adventureId as string),
        enabled: Boolean(adventureId)
    });
}

export function useUpdateAdventure() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            adventureId,
            payload,
        }: {
            adventureId: string;
            payload: AdventureUpdatePayload;
        }) => updateAdventureRequest(adventureId, payload),

        onSuccess: async (updatedAdventure) => {
            queryClient.setQueryData(adventureQueryKeys.detail(updatedAdventure.id), updatedAdventure);

            await queryClient.invalidateQueries({queryKey: adventureQueryKeys.lists()})
        }
    });
}

export function useToggleAdventureFavorite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({adventureId, isFavorite}: {adventureId: string; isFavorite: boolean}) => updateAdventureRequest(adventureId, {is_favorite: isFavorite}),
        onSuccess: async (updatedAdventure) => {
            queryClient.setQueryData(adventureQueryKeys.detail(updatedAdventure.id), updatedAdventure);

            await queryClient.invalidateQueries({queryKey: adventureQueryKeys.lists()});
        }
    });
}

export function useDeleteAdventure() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (adventureId: string) => deleteAdventureRequest(adventureId),
        onSuccess: async (_, adventureId) => {
            queryClient.removeQueries({queryKey: adventureQueryKeys.detail(adventureId)});

            await queryClient.invalidateQueries({queryKey: adventureQueryKeys.lists()});
        }
    });
}