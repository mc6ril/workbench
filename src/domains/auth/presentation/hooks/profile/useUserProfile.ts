import { useQuery } from "@tanstack/react-query";

import { getProfile } from "@/domains/auth/core/usecases/profile/getProfile";
import { userProfileRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/auth/presentation/hooks/queryKeys";

/**
 * Hook for fetching a user profile by ID.
 */
export const useUserProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.userProfiles.detail(userId ?? ""),
    queryFn: () => getProfile(userProfileRepository, userId!),
    enabled: !!userId,
  });
};
