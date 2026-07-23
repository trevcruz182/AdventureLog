import { Alert } from "react-native";

import { useNetworkStatus } from "./NetworkProvider";

type OnlineAction = (
    action: () => void
) => void;

export function useOnlineAction(): OnlineAction {
    const {isOnline} = useNetworkStatus();

    return (action) => {
        if(!isOnline) {
            Alert.alert("You're offline", "Reconnect to create, edit, or delete AdventureLog data.");

            return;
        }

        action();
    }
}