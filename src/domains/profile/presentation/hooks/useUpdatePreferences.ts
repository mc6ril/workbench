import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import {
  DEFAULT_USER_PREFERENCES,
  type UserProfile,
} from "@/domains/profile/core/domain/profile.types";
import {
  updatePreferences,
  type UpdatePreferencesInput,
} from "@/domains/profile/core/usecases/updatePreferences";
import { profileGateway } from "@/domains/profile/infrastructure/profileGateway.browser";
import { queryKeys } from "@/domains/profile/presentation/hooks/queryKeys";
import { useMyProfile } from "@/domains/profile/presentation/hooks/useMyProfile";

/**
 * Hook for updating user preferences (theme, notifications, language).
 */
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  const { data: identity } = useAuthIdentity();
  const { data: profile } = useMyProfile();
  const currentPreferences = profile?.preferences ?? DEFAULT_USER_PREFERENCES;

  return useMutation({
    mutationFn: (input: UpdatePreferencesInput) => {
      return updatePreferences(
        profileGateway,
        identity?.userId ?? "",
        currentPreferences,
        input
      );
    },
    onSuccess: (_data, input) => {
      if (identity) {
        queryClient.setQueryData<UserProfile | null>(
          queryKeys.userProfiles.detail(identity.userId),
          (currentProfile) => {
            if (!currentProfile) {
              return currentProfile;
            }

            return {
              ...currentProfile,
              preferences: {
                ...currentPreferences,
                ...input,
              },
            };
          }
        );
      }
    },
  });
};
