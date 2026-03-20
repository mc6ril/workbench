import { useSession } from "@/shared/session";

import { useUserProfile } from "@/domains/profile/presentation/hooks/profile/useUserProfile";

/**
 * Hook for fetching the current authenticated user's profile.
 */
export const useCurrentUserProfile = () => {
  const { data: session } = useSession();

  return useUserProfile(session?.userId);
};
