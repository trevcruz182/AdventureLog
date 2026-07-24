import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AdventureReminder } from "@/types/reminder";

const REMINDERS_STORAGE_KEY = "adventurelog.reminders";

type StoredReminders = Record<string, AdventureReminder>;

async function getStoredReminders(): Promise<StoredReminders> {
    const storedValue = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);

    if(!storedValue) {
        return {};
    }

    try {
        return JSON.parse(storedValue) as StoredReminders;
    }
    catch {
        return {};
    }
}

async function saveStoredReminders(reminders: StoredReminders): Promise<void> {
    await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
}

export async function getAdventureReminder(adventureId: string): Promise<AdventureReminder | null> {
    const reminders = await getStoredReminders();

    return reminders[adventureId] ?? null;
}

export async function saveAdventureReminder(reminder: AdventureReminder): Promise<void> {
    const reminders = await getStoredReminders();

    reminders[reminder.adventureId] = reminder;

    await saveStoredReminders(reminders);
}

export async function removeAdventureReminder(adventureId: string): Promise<void> {
    const reminders = await getStoredReminders();

    delete reminders[adventureId];

    await saveStoredReminders(reminders);
}