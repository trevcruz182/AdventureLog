import AsyncStorage from "@react-native-async-storage/async-storage";

import type { CreateAdventureFormValues } from "@/features/adventures/createAdventureSchema";

export type CreateAdventureDraftValues = Omit<CreateAdventureFormValues, "photos">;

export type CreateAdventureDraft = {
    values: CreateAdventureDraftValues;
    currentStep: number;
    savedAt: string;
};

function getDraftStorageKey(userId: string): string {
    return `adventurelog.create-draft.${userId}`;
}

function getDraftValues(values: CreateAdventureFormValues): CreateAdventureDraftValues {
    return {
        title: values.title,
        status: values.status,
        category: values.category,
        description: values.description,
        date: values.date,
        locationName: values.locationName,
        latitude: values.latitude,
        longitude: values.longitude,
        rating: values.rating,
        isFavorite: values.isFavorite
    };
}

export async function saveCreateAdventureDraft(userId: string, values: CreateAdventureFormValues, currentStep: number): Promise<void> {
    const draft: CreateAdventureDraft = {
        values: getDraftValues(values),
        currentStep,
        savedAt: new Date().toISOString()
    };

    await AsyncStorage.setItem(getDraftStorageKey(userId), JSON.stringify(draft));
}

export async function getCreateAdventureDraft(userId: string): Promise<CreateAdventureDraft | null> {
    const storedDraft = await AsyncStorage.getItem(getDraftStorageKey(userId));

    if(!storedDraft) {
        return null;
    }

    try {
        return JSON.parse(storedDraft) as CreateAdventureDraft;
    }
    catch {
        await deleteCreateAdventureDraft(userId);

        return null;
    }
}

export async function deleteCreateAdventureDraft(userId: string): Promise<void> {
    await AsyncStorage.removeItem(getDraftStorageKey(userId));
}