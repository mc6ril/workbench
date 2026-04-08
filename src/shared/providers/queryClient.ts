import { QueryClient } from "@tanstack/react-query";

/**
 * Shared React Query client configuration for both client-side providers and
 * server-side prefetch/hydration.
 */
export const createAppQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });
};
