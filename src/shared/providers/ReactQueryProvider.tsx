"use client";

import type { PropsWithChildren } from "react";
import { useState } from "react";
import dynamic from "next/dynamic";
import {
  type DehydratedState,
  environmentManager,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import { createAppQueryClient } from "./queryClient";
import { BUILD_BUSTER, createQueryPersister } from "./queryPersister";

type ReactQueryProviderProps = PropsWithChildren<{
  dehydratedState?: DehydratedState;
  userId: string;
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

let browserQueryClient: QueryClient | undefined = undefined;

const getQueryClient = () => {
  if (environmentManager.isServer()) {
    return createAppQueryClient();
  } else {
    if (!browserQueryClient) {
      browserQueryClient = createAppQueryClient();
    }
    return browserQueryClient;
  }
};

const ReactQueryProvider = ({
  children,
  dehydratedState,
  userId,
}: ReactQueryProviderProps) => {
  const queryClient = getQueryClient();
  const [persister] = useState(() => createQueryPersister(userId));

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000,
        buster: BUILD_BUSTER,
      }}
    >
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
      {isReactQueryDevtoolsEnabled && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </PersistQueryClientProvider>
  );
};

export default ReactQueryProvider;
