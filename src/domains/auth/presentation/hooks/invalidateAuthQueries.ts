import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/domains/auth/presentation/hooks/queryKeys";

type InvalidateAuthQueriesOptions = {
  includeProjects?: boolean;
};

/**
 * Centralizes auth-related cache invalidations.
 */
export const invalidateAuthQueries = async (
  queryClient: QueryClient,
  options: InvalidateAuthQueriesOptions = {}
): Promise<void> => {
  const invalidations: Promise<unknown>[] = [
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.auth.passwordCapability(),
    }),
  ];

  if (options.includeProjects) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() })
    );
  }

  await Promise.all(invalidations);
};
