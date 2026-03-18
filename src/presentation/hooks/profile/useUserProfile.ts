import { useQuery } from "@tanstack/react-query";

import { getProfile } from "@/domains/project-management/core/usecases/profile/getProfile";

import { userProfileRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching a user profile by ID.
 * Returns the profile with display name and avatar URL.
 *
 * @param userId - User ID to fetch profile for (query disabled when undefined)
 * @returns React Query hook result with UserProfile, loading state, and error
 */
export const useUserProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.userProfiles.detail(userId ?? ""),
    queryFn: () => getProfile(userProfileRepository, userId!),
    enabled: !!userId,
  });
};
