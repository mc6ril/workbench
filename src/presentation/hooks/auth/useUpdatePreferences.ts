import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdatePreferencesInput } from "@/domains/project-management/core/domain/schema/auth.schema";
import { DEFAULT_USER_PREFERENCES } from "@/domains/project-management/core/domain/schema/auth.schema";

import { updatePreferences } from "@/domains/project-management/core/usecases/profile/updatePreferences";

import { userProfileRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

import { useSession } from "./useSession";

/**
 * Hook for updating user preferences (theme, notifications, language).
 * Merges partial input with current session preferences before persisting
 * to user_profiles.preferences.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (input: UpdatePreferencesInput) => {
      const currentPreferences =
        session?.preferences ?? DEFAULT_USER_PREFERENCES;

      return updatePreferences(
        userProfileRepository,
        session?.userId ?? "",
        currentPreferences,
        input
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      if (session) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.userProfiles.detail(session.userId),
        });
      }
    },
  });
};
