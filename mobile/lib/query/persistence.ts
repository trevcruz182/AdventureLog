import AsyncStorage from "@react-native-async-storage/async-storage";
import {createAsyncStoragePersister} from "@tanstack/query-async-storage-persister";

export const QUERY_CACHE_KEY = "adventurelog.query-cache.v1";

export const QUERY_CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7;

export const QUERY_CACHE_BUSTER = "adventurelog-cache-v1";

export const queryPersister = createAsyncStoragePersister({
    storage: AsyncStorage,
    key: QUERY_CACHE_KEY,
    throttleTime: 1000
});

export async function clearPersistedQueryCache(): Promise<void> {
    await AsyncStorage.removeItem(QUERY_CACHE_KEY);
}