import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/domains/session/presentation/hooks/queryKeys";

/**
 * Centralizes current session cache invalidations for auth-driven mutations.
 */
export const invalidateSessionQueries = async (
  queryClient: QueryClient
): Promise<void> => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: queryKeys.session.current(),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.session.passwordCapability(),
    }),
  ]);
};
