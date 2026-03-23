import { useCallback, useMemo } from "react";

import {
  DEFAULT_USER_PREFERENCES,
  type GettingStartedStatus,
} from "@/domains/profile/core/domain/profilePreferences.schema";
import { useMyProfile } from "@/domains/profile/presentation/hooks/useMyProfile";
import { useUpdatePreferences } from "@/domains/profile/presentation/hooks/useUpdatePreferences";

/**
 * Hook for reading and updating the persisted board/ticket onboarding state.
 * Uses profile preferences as the single source of truth.
 */
export const useTicketGettingStartedStatus = () => {
  const { data: profile, isLoading } = useMyProfile();
  const updatePreferencesMutation = useUpdatePreferences();

  const status = useMemo<GettingStartedStatus>(() => {
    return (
      profile?.preferences.gettingStartedStatus ??
      DEFAULT_USER_PREFERENCES.gettingStartedStatus
    );
  }, [profile?.preferences.gettingStartedStatus]);

  const setStatus = useCallback(
    (nextStatus: GettingStartedStatus) => {
      updatePreferencesMutation.mutate({
        gettingStartedStatus: nextStatus,
      });
    },
    [updatePreferencesMutation]
  );

  const setStatusAsync = useCallback(
    (nextStatus: GettingStartedStatus) => {
      return updatePreferencesMutation.mutateAsync({
        gettingStartedStatus: nextStatus,
      });
    },
    [updatePreferencesMutation]
  );

  const markSkipped = useCallback(() => {
    setStatus("skipped");
  }, [setStatus]);

  const markCompleted = useCallback(() => {
    setStatus("completed");
  }, [setStatus]);

  return {
    status,
    canAutoOpen: status === "pending",
    isLoading,
    isPending: updatePreferencesMutation.isPending,
    error: updatePreferencesMutation.error,
    setStatus,
    setStatusAsync,
    markSkipped,
    markCompleted,
  };
};
