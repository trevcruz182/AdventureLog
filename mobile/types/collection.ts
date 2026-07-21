import type { Adventure } from "./adventure";

export type CollectionIcon = "map-outline" | "leaf-outline" | "snow-outline" | "restaurant-outline" | "trophy-outline" | "airplane-outline" | "camera-outline" | "compass-outline";

export type AdventureCollection = {
    id: string;
    user_id: string;
    title: string;
    description: string;
    icon: CollectionIcon;
    target_count: number;
    adventure_count: number;
    created_at: string;
    updated_at: string;
};

export type AdventureCollectionDetail = AdventureCollection & {
    adventures: Adventure[];
}

export type CollectionCreatePayload = {
    title: string;
    description: string;
    icon: CollectionIcon;
    target_count: number;
};

export type CollectionUpdatePayload = Partial<CollectionCreatePayload>;