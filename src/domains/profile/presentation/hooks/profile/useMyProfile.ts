import { useUserProfile } from "@/domains/profile/presentation/hooks/profile/useUserProfile";
import { useSession } from "@/domains/session/presentation/hooks/useSession";

/**
 * Hook for fetching the current authenticated user's profile.
 */
export const useMyProfile = () => {
  const { data: session } = useSession();

  return useUserProfile(session?.userId);
};
