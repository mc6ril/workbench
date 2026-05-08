import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/domains/auth/presentation/hooks/identity/queryKeys";

export const invalidateAuthIdentityQueries = async (
  queryClient: QueryClient
): Promise<void> => {
  await queryClient.invalidateQueries({
    queryKey: queryKeys.authIdentity.current(),
  });
};
