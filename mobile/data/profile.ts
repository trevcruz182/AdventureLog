export type ProfileStat = {
    id: string;
    label: string;
    value: string;
};

export type AdventureCollection = {
    id: string;
    title: string;
    description: string;
    completed: number;
    total: number;
    icon: "snow-outline" | "leaf-outline" | "map-outline" | "restaurant-outline";
};

export type AdventureAchievement = {
    id: string;
    title: string;
    description: string;
    earnedDate: string;
    icon: "compass-outline" | "sunny-outline" | "camera-outline" | "trail-sign-outline";
};

export const profileStats: ProfileStat[] = [
    {
        id: "adventures",
        label: "Adventures",
        value: "18",
    },
    {
        id: "places",
        label: "Places",
        value: "12",
    },
    {
        id: "favorites",
        label: "Favorites",
        value: "7",
    },
];

export const profileCollections: AdventureCollection[] = [
    {
        id: "rinks",
        title: "Rinks Visited",
        description: "Explore five different hockey rinks.",
        completed: 3,
        total: 5,
        icon: "snow-outline",
    },
    {
        id: "hudson",
        title: "Hudson Valley Explorer",
        description: "Record ten adventures around the Hudson Valley.",
        completed: 6,
        total: 10,
        icon: "map-outline",
    },
    {
        id: "trails",
        title: "Trail Starter",
        description: "Complete five hiking adventures.",
        completed: 4,
        total: 5,
        icon: "leaf-outline",
    },
    {
        id: "food",
        title: "Worth the Trip",
        description: "Save five memorable food adventures.",
        completed: 2,
        total: 5,
        icon: "restaurant-outline",
    },
];

export const profileAchievements: AdventureAchievement[] = [
    {
        id: "first-five",
        title: "First Five",
        description: "Logged five adventures.",
        earnedDate: "June 8",
        icon: "compass-outline",
    },
    {
        id: "golden-hour",
        title: "Golden Hour",
        description: "Saved an adventure at sunset.",
        earnedDate: "July 6",
        icon: "sunny-outline",
    },
    {
        id: "memory-keeper",
        title: "Memory Keeper",
        description: "Added photos to ten adventures.",
        earnedDate: "July 3",
        icon: "camera-outline",
    },
];