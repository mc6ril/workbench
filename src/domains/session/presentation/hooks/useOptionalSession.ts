import { useQuery } from "@tanstack/react-query";

import { sessionGateway } from "@/domains/session/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/session/presentation/hooks/queryKeys";

type UseOptionalSessionOptions = {
  enabled?: boolean;
  queryKeySuffix?: readonly unknown[];
};

/**
 * Reads the current session without throwing when the user is unauthenticated.
 * This is useful for flows that need to detect session recovery.
 */
export const useOptionalSession = (options: UseOptionalSessionOptions = {}) => {
  const { enabled = true, queryKeySuffix = [] } = options;

  return useQuery({
    queryKey: [...queryKeys.session.current(), ...queryKeySuffix],
    queryFn: () => sessionGateway.getCurrentSession(),
    enabled,
    retry: false,
  });
};
