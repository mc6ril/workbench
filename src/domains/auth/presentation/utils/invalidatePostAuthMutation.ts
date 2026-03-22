import type { QueryClient } from "@tanstack/react-query";

import { queryKeys as projectQueryKeys } from "@/domains/project/presentation/hooks/queryKeys";
import { invalidateSessionQueries } from "@/domains/session/presentation/hooks/invalidateSessionQueries";

type InvalidatePostAuthMutationOptions = {
  includeProjects?: boolean;
};

/**
 * Invalidates cross-domain caches after an auth mutation succeeds.
 * Auth owns the mutation orchestration, while session/project own the caches.
 */
export const invalidatePostAuthMutation = async (
  queryClient: QueryClient,
  options: InvalidatePostAuthMutationOptions = {}
): Promise<void> => {
  await invalidateSessionQueries(queryClient);

  if (options.includeProjects) {
    await queryClient.invalidateQueries({
      queryKey: projectQueryKeys.projects.all(),
    });
  }
};
