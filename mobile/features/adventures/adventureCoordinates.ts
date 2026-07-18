import type { Adventure } from "@/types/adventure";

export type MappedAdventure = Adventure & {
    latitudeNumber: number;
    longitudeNumber: number;
};

function parseCoordinate(value: string | number | null): number | null {
    if(value === null) {
        return null;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
}

export function getMappedAdventures(adventures: Adventure[]): MappedAdventure[] {
    return adventures.flatMap((adventure) => {
        const latitudeNumber = parseCoordinate(adventure.latitude);

        const longitudeNumber = parseCoordinate(adventure.longitude);

        if(latitudeNumber === null || longitudeNumber === null) {
            return [];
        }

        return [{
            ...adventure,
            latitudeNumber,
            longitudeNumber,
        }]
    });
}