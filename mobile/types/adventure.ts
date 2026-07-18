export type AdventureCategory = "hiking" | "sports" | "travel" | "food" | "outdoors";

export type AdventureStatus = "completed" | "wishlist";

export type AdventurePhoto = {
    id: string;
    image_url: string;
    public_id: string;
    position: number;
    created_at: string;
    updated_at: string;
};

export type Adventure = {
    id: string;
    user_id: string;

    title: string;
    description: string;
    category: AdventureCategory;
    status: AdventureStatus;

    adventure_date: string;
    location_name: string;

    latitude: string | number | null;
    longitude: string | number | null;

    rating: number;
    is_favorite: boolean;

    photos: AdventurePhoto[];

    created_at: string;
    updated_at: string;
};

export type AdventurePhotoCreate = {
    image_url: string;
    public_id: string;
};

export type AdventureCreatePayload = {
    title: string;
    description: string;
    category: AdventureCategory;
    status: AdventureStatus;

    adventure_date: string;
    location_name: string;

    latitude: number | null;
    longitude: number | null;

    rating: number;
    is_favorite: boolean;

    photos: AdventurePhotoCreate[];
};

export type AdventureListResponse = {
    items: Adventure[];
    total: number;
    offset: number;
    limit: number;
};

export type AdventureListParams = {
    category?: AdventureCategory;
    status?: AdventureStatus;
    isFavorite?: boolean;
    search?: string;
    offset?: number;
    limit?: number;
}