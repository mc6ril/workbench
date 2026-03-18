import { useQuery } from "@tanstack/react-query";

import { getCurrentSession } from "@/domains/project-management/core/usecases/auth/getCurrentSession";

import { authRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching the current user session.
 *
 * @returns React Query hook result with session data, loading state, and error
 */
export const useSession = () => {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: () => getCurrentSession(authRepository),
  });
};
