import { useEffect } from "react";

import { useUserProfile } from "@/domains/profile/presentation/hooks/useUserProfile";
import { persistLightUserCookieInBrowser } from "@/domains/session/infrastructure/lightUserCookie";
import { useSession } from "@/domains/session/presentation/hooks/useSession";

type UseMyProfileOptions = {
  enabled?: boolean;
};

/**
 * Hook for fetching the current authenticated user's profile.
 */
export const useMyProfile = (options?: UseMyProfileOptions) => {
  const { data: session } = useSession();

  const profileQuery = useUserProfile(session?.userId, options);

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    persistLightUserCookieInBrowser({
      displayName: profileQuery.data.displayName ?? undefined,
      avatarUrl: profileQuery.data.avatarUrl ?? undefined,
    });
  }, [profileQuery.data]);

  return profileQuery;
};
