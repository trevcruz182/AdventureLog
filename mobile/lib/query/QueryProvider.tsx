import { QueryClient } from "@tanstack/react-query";
import {PersistQueryClientProvider} from "@tanstack/react-query-persist-client";
import { PropsWithChildren, useState } from "react";

import { QUERY_CACHE_BUSTER, QUERY_CACHE_MAX_AGE, queryPersister } from "./persistence";

const persistedQueryRoots = new Set(["adventures", "collections"]);

export function QueryProvider({children}: PropsWithChildren) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30_000,

                gcTime: QUERY_CACHE_MAX_AGE, // keeps cached queries for as long as possible.
                retry: 1,
                refetchOnWindowFocus: false
            },

            mutations: {
                retry: 0,
                networkMode: "always" // execute the mutation func even offline. Rather than pausing, it'll be rejected by the API immediately.
            }
        }
    }));

    return(
        <PersistQueryClientProvider 
            client={queryClient}
            persistOptions={{
                persister: queryPersister,
                maxAge: QUERY_CACHE_MAX_AGE,
                buster: QUERY_CACHE_BUSTER,
                dehydrateOptions: {
                    shouldDehydrateMutation: () => false, // does not persist mutations
                    shouldDehydrateQuery: (query) => {
                        const queryRoot = query.queryKey[0];

                        return (query.state.status === "success" && typeof queryRoot === "string" && persistedQueryRoots.has(queryRoot))
                    }
                }
            }}
        >
            {children}
        </PersistQueryClientProvider>
    );
}