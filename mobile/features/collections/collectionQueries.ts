export const collectionQueryKeys = {
    all: ["collections"] as const,

    lists: () => [...collectionQueryKeys.all, "list"] as const,

    list: () => [...collectionQueryKeys.lists()] as const,

    details: () => [...collectionQueryKeys.all, "detail"] as const,

    detail: (collectionId: string) => [...collectionQueryKeys.details(), collectionId] as const
};