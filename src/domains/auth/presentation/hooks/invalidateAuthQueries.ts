import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/domains/auth/presentation/hooks/queryKeys";
import { queryKeys as sessionQueryKeys } from "@/domains/session/presentation/hooks/queryKeys";

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
    queryClient.invalidateQueries({
      queryKey: sessionQueryKeys.session.current(),
    }),
    queryClient.invalidateQueries({
      queryKey: sessionQueryKeys.session.passwordCapability(),
    }),
  ];

  if (options.includeProjects) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() })
    );
  }

  await Promise.all(invalidations);
};
