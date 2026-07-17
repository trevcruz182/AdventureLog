import type { AdventureListParams } from "@/types/adventure";

export const adventureQueryKeys = {
    all: ["adventures"] as const,

    lists: () => [...adventureQueryKeys.all, "list"] as const,

    list: (params: AdventureListParams) => [...adventureQueryKeys.lists(), params] as const,

    details: () => [...adventureQueryKeys.all, "detail"] as const,

    detail: (adventureId: string) => [...adventureQueryKeys.details(), adventureId] as const,
};