import { useUserProfile } from "@/domains/profile/presentation/hooks/useUserProfile";
import { useSession } from "@/domains/session/presentation/hooks/useSession";

type UseMyProfileOptions = {
  enabled?: boolean;
};

/**
 * Hook for fetching the current authenticated user's profile.
 */
export const useMyProfile = (options?: UseMyProfileOptions) => {
  const { data: session } = useSession();

  return useUserProfile(session?.userId, options);
};
