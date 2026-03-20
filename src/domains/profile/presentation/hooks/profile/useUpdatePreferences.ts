import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useSession } from "@/shared/session";

import {
  DEFAULT_USER_PREFERENCES,
  type UpdatePreferencesInput,
} from "@/domains/profile/core/domain/schema/profilePreferences.schema";
import { updatePreferences } from "@/domains/profile/core/usecases/updatePreferences";
import { userProfileRepository } from "@/domains/profile/infrastructure/supabase/repositories";
import { useMyProfile } from "@/domains/profile/presentation/hooks/profile/useMyProfile";
import { queryKeys } from "@/domains/profile/presentation/hooks/queryKeys";

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
        userProfileRepository,
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
