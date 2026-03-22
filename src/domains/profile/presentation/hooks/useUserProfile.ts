import { useQuery } from "@tanstack/react-query";

import { getProfile } from "@/domains/profile/core/usecases/getProfile";
import { userProfileRepository } from "@/domains/profile/infrastructure/userProfileRepository.browser";
import { queryKeys } from "@/domains/profile/presentation/hooks/queryKeys";

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
