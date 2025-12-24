import { useQuery } from "@tanstack/react-query";

import { getCurrentSession } from "@/core/usecases/getCurrentSession";

import { authRepositorySupabase } from "@/infrastructure/supabase/repositories/authRepositorySupabase";

import { queryKeys } from "./queryKeys";

/**
 * Hook for fetching the current user session.
 *
 * @returns React Query hook result with session data, loading state, and error
 */
export const useSession = () => {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: () => getCurrentSession(authRepositorySupabase),
  });
};

