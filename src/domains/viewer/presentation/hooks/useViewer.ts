import { useMemo } from "react";

import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import { buildCurrentViewer } from "@/domains/viewer/core/usecases/buildCurrentViewer";

/**
 * Hook for reading the current viewer as a pure read-model.
 * It never exposes raw access tokens or mutation capabilities.
 */
export const useViewer = () => {
  const identityQuery = useAuthIdentity();

  const viewer = useMemo(() => {
    if (!identityQuery.data) {
      return null;
    }

    return buildCurrentViewer(identityQuery.data);
  }, [identityQuery.data]);

  return {
    data: viewer,
    error: identityQuery.error ?? null,
    isError: identityQuery.isError,
    isLoading: identityQuery.isLoading,
    isPending: identityQuery.isPending,
    isSuccess: !!viewer && identityQuery.isSuccess,
  };
};
