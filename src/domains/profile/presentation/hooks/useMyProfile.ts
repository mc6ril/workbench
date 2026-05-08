import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import { useUserProfile } from "@/domains/profile/presentation/hooks/useUserProfile";

type UseMyProfileOptions = {
  enabled?: boolean;
};

/**
 * Hook for fetching the current authenticated user's profile.
 */
export const useMyProfile = (options?: UseMyProfileOptions) => {
  const { data: identity } = useAuthIdentity();

  return useUserProfile(identity?.userId, options);
};
