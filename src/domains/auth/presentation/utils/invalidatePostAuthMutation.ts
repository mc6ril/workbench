import type { QueryClient } from "@tanstack/react-query";

import { invalidateAuthIdentityQueries } from "@/domains/auth/presentation/hooks/identity/invalidateAuthIdentityQueries";
import { queryKeys as projectQueryKeys } from "@/domains/project/presentation/hooks/queryKeys";

type InvalidatePostAuthMutationOptions = {
  includeProjects?: boolean;
};

/**
 * Invalidates cross-domain caches after an auth mutation succeeds.
 * Auth owns the mutation orchestration, while auth identity/project own the caches.
 */
export const invalidatePostAuthMutation = async (
  queryClient: QueryClient,
  options: InvalidatePostAuthMutationOptions = {}
): Promise<void> => {
  await invalidateAuthIdentityQueries(queryClient);

  if (options.includeProjects) {
    await queryClient.invalidateQueries({
      queryKey: projectQueryKeys.projects.all(),
    });
  }
};
