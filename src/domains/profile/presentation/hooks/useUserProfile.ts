import { useQuery } from "@tanstack/react-query";

import { getProfile } from "@/domains/profile/core/usecases/getProfile";
import { profileGateway } from "@/domains/profile/infrastructure/profileGateway.browser";
import { queryKeys } from "@/domains/profile/presentation/hooks/queryKeys";

type UseUserProfileOptions = {
  enabled?: boolean;
};

/**
 * Hook for fetching a user profile by ID.
 */
export const useUserProfile = (
  userId: string | undefined,
  options?: UseUserProfileOptions
) => {
  return useQuery({
    queryKey: queryKeys.userProfiles.detail(userId ?? ""),
    queryFn: () => getProfile(profileGateway, userId!),
    enabled: (options?.enabled ?? true) && !!userId,
  });
};
