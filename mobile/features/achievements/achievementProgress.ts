import type { Adventure } from "@/types/adventure";
import type { AdventureCollection } from "@/types/collection";

export type AchievementIcon = "trail-sign-outline" | "compass-outline" | "camera-outline" | "leaf-outline" | "map-outline" | "albums-outline";

export type AdventureAchievement = {
    id: string;
    title: string;
    description: string;
    icon: AchievementIcon;

    isEarned: boolean;
    current: number;
    target: number;
    earnedDate: string | null;
};

function formatAchievementDate(value: string | undefined): string | null {
    if(!value) {
        return null;
    }

    if(/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split("-").map(Number);

        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        }).format(new Date(year, month - 1, day));
    }
    
    const date = new Date(value);

    if(Number.isNaN(date.getTime())) {
        return null;
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    }).format(date);
}

function getProgress(current: number, target: number): number {
    return Math.min(current, target);
} 

export function getAdventureAchievements(adventures: Adventure[], collections: AdventureCollection[]): AdventureAchievement[] {
    const completedAdventures = adventures.filter((adventure) => adventure.status === "completed")
        .sort((first, second) => first.adventure_date.localeCompare(second.adventure_date));

    const photoAdventures = completedAdventures.filter((adventure) => adventure.photos.length > 0);

    const hikingAdventures = completedAdventures.filter((adventure) => adventure.category === "hiking");

    const uniquePlaceAdventures: Adventure[] = [];
    const encounteredPlaces = new Set<string>();

    for(const adventure of completedAdventures) {
        const normalizedPlace = adventure.location_name.trim().toLowerCase();

        if(!normalizedPlace || encounteredPlaces.has(normalizedPlace)) {
            continue;
        }

        encounteredPlaces.add(normalizedPlace);
        uniquePlaceAdventures.push(adventure);
    }

    const collectionsOldestFirst = [...collections].sort((first, second) => first.created_at.localeCompare(second.created_at));

    return [
        {
            id: "first-mark",
            title: "First Mark",
            description: "Complete your first adventure.",
            icon: "trail-sign-outline",
            isEarned: completedAdventures.length >= 1,
            current: getProgress(completedAdventures.length, 1),
            target: 1,
            earnedDate: formatAchievementDate(completedAdventures[0]?.adventure_date)
        },
        {
            id: "first-five",
            title: "First Five",
            description: "Complete five adventures.",
            icon: "compass-outline",
            isEarned: completedAdventures.length >= 5,
            current: getProgress(completedAdventures.length, 5),
            target: 5,
            earnedDate: formatAchievementDate(completedAdventures[4]?.adventure_date)
        },
        {
            id: "memory-keeper",
            title: "Memory Keeper",
            description: "Add photos to three adventures.",
            icon: "camera-outline",
            isEarned: photoAdventures.length >= 3,
            current: getProgress(photoAdventures.length, 3),
            target: 3,
            earnedDate: formatAchievementDate(photoAdventures[2]?.adventure_date)
        },
        {
            id: "trail-starter",
            title: "Trail Starter",
            description: "Complete three hiking adventures.",
            icon: "leaf-outline",
            isEarned: hikingAdventures.length >= 3,
            current: getProgress(hikingAdventures.length, 3),
            target: 3,
            earnedDate: formatAchievementDate(hikingAdventures[2]?.adventure_date)
        },
        {
            id: "explorer",
            title: "Explorer",
            description: "Complete adventures in five different places.",
            icon: "map-outline",
            isEarned: uniquePlaceAdventures.length >= 5,
            current: getProgress(uniquePlaceAdventures.length, 5),
            target: 5,
            earnedDate: formatAchievementDate(uniquePlaceAdventures[4]?.adventure_date)
        },
        {
            id: "collector",
            title: "Collector",
            description: "Create three adventure collections.",
            icon: "albums-outline",
            isEarned: collectionsOldestFirst.length >= 3,
            current: getProgress(collectionsOldestFirst.length, 3),
            target: 3,
            earnedDate: formatAchievementDate(collectionsOldestFirst[2]?.created_at)
        },
    ];
}