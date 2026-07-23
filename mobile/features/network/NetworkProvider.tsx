import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

type NetworkContextValue = {
    isOnline: boolean;
    isReady: boolean;
};

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

function resolveOnlineState({isConnected, isInternetReachable}: {isConnected: boolean | null; isInternetReachable: boolean | null;}): boolean {
    // Only marks the app offline when it explicitly reports failed connection or reachability
    return isConnected !== false && isInternetReachable !== false;
}

export function NetworkProvider({children}: PropsWithChildren) {
    const [isOnline, setIsOnline] = useState(true);

    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(
            (state) => {
                const nextIsOnline = resolveOnlineState({
                    isConnected: state.isConnected,
                    isInternetReachable: state.isInternetReachable
                });

                setIsOnline(nextIsOnline);
                setIsReady(true);

                onlineManager.setOnline(nextIsOnline);
            }
        );

        return unsubscribe;
    }, []);

    const value = useMemo(() => ({
        isOnline, isReady
    }), [isOnline, isReady]);

    return (
        <NetworkContext.Provider value={value}>
            {children}
        </NetworkContext.Provider>
    );
}

export function useNetworkStatus(): NetworkContextValue {
    const context = useContext(NetworkContext);

    if(!context) {
        throw new Error("useNetworkStatus must be used inside NetworkProvider.");
    }

    return context;
}