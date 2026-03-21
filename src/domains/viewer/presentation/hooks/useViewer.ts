import { useMemo } from "react";

import { useUserProfile } from "@/domains/profile/presentation/hooks/profile/useUserProfile";
import { useSession } from "@/domains/session/presentation/hooks/useSession";
import { buildCurrentViewer } from "@/domains/viewer/core/usecases/buildCurrentViewer";

/**
 * Hook for reading the current viewer as a pure read-model.
 * It never exposes raw access tokens or mutation capabilities.
 */
export const useViewer = () => {
  const sessionQuery = useSession();
  const profileQuery = useUserProfile(sessionQuery.data?.userId);

  const viewer = useMemo(() => {
    if (!sessionQuery.data || !profileQuery.data) {
      return null;
    }

    return buildCurrentViewer({
      profile: profileQuery.data,
      session: sessionQuery.data,
    });
  }, [profileQuery.data, sessionQuery.data]);

  const hasSession = !!sessionQuery.data?.userId;

  return {
    data: viewer,
    error: sessionQuery.error ?? profileQuery.error ?? null,
    isError: sessionQuery.isError || profileQuery.isError,
    isLoading:
      sessionQuery.isLoading || (hasSession && profileQuery.isLoading),
    isPending:
      sessionQuery.isPending || (hasSession && profileQuery.isPending),
    isSuccess:
      !!viewer && sessionQuery.isSuccess && (!hasSession || profileQuery.isSuccess),
  };
};
