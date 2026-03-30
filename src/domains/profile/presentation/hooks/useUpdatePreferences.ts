import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DEFAULT_USER_PREFERENCES } from "@/domains/profile/core/domain/profile.types";
import {
  updatePreferences,
  type UpdatePreferencesInput,
} from "@/domains/profile/core/usecases/updatePreferences";
import { profileGateway } from "@/domains/profile/infrastructure/profileGateway.browser";
import { queryKeys } from "@/domains/profile/presentation/hooks/queryKeys";
import { useMyProfile } from "@/domains/profile/presentation/hooks/useMyProfile";
import { useSession } from "@/domains/session/presentation/hooks/useSession";

/**
 * Hook for updating user preferences (theme, notifications, language).
 */
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { data: profile } = useMyProfile();

  return useMutation({
    mutationFn: (input: UpdatePreferencesInput) => {
      const currentPreferences =
        profile?.preferences ?? DEFAULT_USER_PREFERENCES;

      return updatePreferences(
        profileGateway,
        session?.userId ?? "",
        currentPreferences,
        input
      );
    },
    onSuccess: () => {
      if (session) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.userProfiles.detail(session.userId),
        });
      }
    },
  });
};
