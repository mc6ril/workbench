"use client";

import type { PropsWithChildren } from "react";
import { useState } from "react";
import {
  type DehydratedState,
  HydrationBoundary,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { createAppQueryClient } from "./queryClient";

type ReactQueryProviderProps = PropsWithChildren<{
  dehydratedState?: DehydratedState;
}>;

/**
 * React Query Provider component.
 * Wraps the application with QueryClientProvider and optionally includes DevTools in development.
 */
const ReactQueryProvider = ({
  children,
  dehydratedState,
}: ReactQueryProviderProps) => {
  const [queryClient] = useState(createAppQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        {children}
      </HydrationBoundary>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

export default ReactQueryProvider;
