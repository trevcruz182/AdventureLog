import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { getAdventureReminder, removeAdventureReminder, saveAdventureReminder } from "./reminderStorage";

import type { AdventureReminder } from "@/types/reminder";

const ADVENTURE_CHANNEL_ID = "adventure-reminders";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    })
});

async function configureAndroidChannel(): Promise<void> {
    if(Platform.OS !== "android") {
        return;
    }

    await Notifications.setNotificationChannelAsync(ADVENTURE_CHANNEL_ID, {
        name: "Adventure reminders",
        description: "Reminders for your planned adventures.",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 150, 250],
        lightColor: "#B96F4A"
    });
}

function hasNotificationPermission(permissions: Notifications.NotificationPermissionsStatus): boolean {
    if(Platform.OS !== "ios") {
        return permissions.granted;
    }

    const iosStatus = permissions.ios?.status;

    return(iosStatus === Notifications.IosAuthorizationStatus.AUTHORIZED || iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL || iosStatus === Notifications.IosAuthorizationStatus.EPHEMERAL);
}

export async function requestReminderPermission(): Promise<boolean> {
    await configureAndroidChannel();

    const existingPermissions = await Notifications.getPermissionsAsync();

    if(hasNotificationPermission(existingPermissions)) {
        return true;
    }

    const requestedPermissions = await Notifications.requestPermissionsAsync();

    return hasNotificationPermission(requestedPermissions);
}

type ScheduleAdventureReminderOptions = {
    adventureId: string;
    adventureTitle: string;
    reminderAt: Date;
};

export async function scheduleAdventureReminder({adventureId, adventureTitle, reminderAt}: ScheduleAdventureReminderOptions): Promise<AdventureReminder> {
    if(reminderAt.getTime() <= Date.now()) {
        throw new Error("The reminder must be scheduled for a future time.");
    }

    const hasPermission = await requestReminderPermission();

    if(!hasPermission) {
        throw new Error("Notification permission was not granted.");
    }

    const existingReminder = await getAdventureReminder(adventureId);

    if(existingReminder) {
        await Notifications.cancelScheduledNotificationAsync(existingReminder.notificationId);
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
            title: "Adventure ahead",
            body: `${adventureTitle} is coming up soon.`,
            sound: true,
            data: {
                adventureId,
                url: `/adventures/${adventureId}`
            },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminderAt,
            channelId: Platform.OS === "android" ? ADVENTURE_CHANNEL_ID : undefined
        }
    });

    const reminder: AdventureReminder = {
        adventureId,
        notificationId,
        reminderAt: reminderAt.toISOString()
    };

    await saveAdventureReminder(reminder);

    return reminder;
}

export async function cancelAdventureReminder(adventureId: string): Promise<void> {
    const existingReminder = await getAdventureReminder(adventureId);

    if(!existingReminder) {
        return;
    }

    await Notifications.cancelScheduledNotificationAsync(existingReminder.notificationId);

    await removeAdventureReminder(adventureId);
}