import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useSession } from "@/shared/session";

import { queryKeys as authQueryKeys } from "@/domains/auth/presentation/hooks/queryKeys";
import {
  DEFAULT_USER_PREFERENCES,
  type UpdatePreferencesInput,
} from "@/domains/profile/core/domain/schema/profilePreferences.schema";
import { updatePreferences } from "@/domains/profile/core/usecases/updatePreferences";
import { userProfileRepository } from "@/domains/profile/infrastructure/supabase/repositories";
import { useCurrentUserProfile } from "@/domains/profile/presentation/hooks/profile/useCurrentUserProfile";
import { queryKeys } from "@/domains/profile/presentation/hooks/queryKeys";

/**
 * Hook for updating user preferences (theme, notifications, language).
 */
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { data: profile } = useCurrentUserProfile();

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
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.auth.session(),
      });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.auth.user(),
      });
      if (session) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.userProfiles.detail(session.userId),
        });
      }
    },
  });
};
