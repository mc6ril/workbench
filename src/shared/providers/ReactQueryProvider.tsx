"use client";

import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  type DehydratedState,
  HydrationBoundary,
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  hydratePersistedIdentityCache,
  syncPersistedIdentityCache,
} from "./persistedIdentityCache";
import { createAppQueryClient } from "./queryClient";

type ReactQueryProviderProps = PropsWithChildren<{
  dehydratedState?: DehydratedState;
}>;

const ReactQueryDevtools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then(
      (mod) => mod.ReactQueryDevtools
    ),
  { ssr: false }
);

const isReactQueryDevtoolsEnabled =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_ENABLE_QUERY_DEVTOOLS === "true";

/**
 * React Query Provider component.
 * Wraps the application with QueryClientProvider and optionally includes DevTools in development.
 */
const ReactQueryProvider = ({
  children,
  dehydratedState,
}: ReactQueryProviderProps) => {
  const [queryClient] = useState(createAppQueryClient);

  useEffect(() => {
    hydratePersistedIdentityCache(queryClient);
    syncPersistedIdentityCache(queryClient);

    return queryClient.getQueryCache().subscribe(() => {
      syncPersistedIdentityCache(queryClient);
    });
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
      {isReactQueryDevtoolsEnabled && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

export default ReactQueryProvider;
