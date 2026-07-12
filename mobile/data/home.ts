export type AdventureCategory = "hiking" | "sports" | "travel" | "food" | "outdoors";

export type RecentAdventure = {
    id: string;
    title: string;
    location: string;
    date: string;
    category: AdventureCategory;
    imageUrl: string;
};

export const featuredAdventure = {
    title: "Sunset at Bear Mountain",
    location: "Bear Mountain, New York",
    date: "July 6, 2026",
    category: "Hiking",
    imageUrl: "https://images.unsplash.com/photo-1671433709069-8ef7ab4e9c4e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
};

export const homeStats = [
    {
        id: "adventures",
        label: "Adventures",
        value: "18",
        icon: "compass-outline" as const,
    },
    {
        id: "places",
        label: "Places",
        value: "12",
        icon: "location-outline" as const,
    },
    {
        id: "photos",
        label: "Photos",
        value: "146",
        icon: "images-outline" as const,
    },
];

export const activeCollection = {
    title: "Rinks Visited",
    description: "Explore five different hockey rinks.",
    completed: 3,
    total: 5,
    icon: "snow-outline" as const,
};

export const recentAdventures: RecentAdventure[] = [
    {
        id: "1",
        title: "Friday Night Hockey",
        location: "Brewster Ice Arena",
        date: "July 3",
        category: "sports",
        imageUrl: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=800&q=85"
    },
    {
        id: "2",
        title: "Hudson River Walk",
        location: "Peekskill, New York",
        date: "June 28",
        category: "outdoors",
        imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=85"
    },
    {
        id: "3",
        title: "A Day in Beacon",
        location: "Beacon, New York",
        date: "June 21",
        category: "travel",
        imageUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800&q=85"
    },
];