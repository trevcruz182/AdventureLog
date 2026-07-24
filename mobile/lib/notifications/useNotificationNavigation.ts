import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";

function getAdventureId(notification: Notifications.Notification): string | null {
    const adventureId = notification.request.content.data?.adventureId;

    return typeof adventureId === "string" ? adventureId : null;
}

export function useNotificationNavigation(canNavigate: boolean): void {
    useEffect(() => {
        let isActive = true;

        async function openNotification(notification: Notifications.Notification) {
            if(!canNavigate || !isActive) {
                return;
            }

            const adventureId = getAdventureId(notification);

            if(!adventureId) {
                return;
            }

            await Notifications.clearLastNotificationResponse(); // Clears response after handling it so same adventure isn't opened on every app launch

            if(!isActive) {
                return;
            }

            router.push({
                pathname: "/adventures/[adventureId]",
                params: {
                    adventureId
                }
            });
        }

        async function checkInitialResponse() {
            if(!canNavigate) {
                return;
            }

            const response = await Notifications.getLastNotificationResponse();

            if(response?.notification) {
                await openNotification(response.notification);
            }
        }

        void checkInitialResponse();

        const subscription = Notifications.addNotificationResponseReceivedListener((response) => void openNotification(response.notification));

        return () => {
            isActive = false;
            subscription.remove();
        };
    }, [canNavigate]);
}