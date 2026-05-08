import { useMemo } from "react";

import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import { useUserProfile } from "@/domains/profile/presentation/hooks/useUserProfile";
import { buildCurrentViewer } from "@/domains/viewer/core/usecases/buildCurrentViewer";

/**
 * Hook for reading the current viewer as a pure read-model.
 * It never exposes raw access tokens or mutation capabilities.
 */
export const useViewer = () => {
  const identityQuery = useAuthIdentity();
  const profileQuery = useUserProfile(identityQuery.data?.userId);

  const viewer = useMemo(() => {
    if (!identityQuery.data || !profileQuery.data) {
      return null;
    }

    return buildCurrentViewer({
      profile: profileQuery.data,
      identity: identityQuery.data,
    });
  }, [identityQuery.data, profileQuery.data]);

  const hasIdentity = !!identityQuery.data?.userId;

  return {
    data: viewer,
    error: identityQuery.error ?? profileQuery.error ?? null,
    isError: identityQuery.isError || profileQuery.isError,
    isLoading:
      identityQuery.isLoading || (hasIdentity && profileQuery.isLoading),
    isPending:
      identityQuery.isPending || (hasIdentity && profileQuery.isPending),
    isSuccess:
      !!viewer &&
      identityQuery.isSuccess &&
      (!hasIdentity || profileQuery.isSuccess),
  };
};
