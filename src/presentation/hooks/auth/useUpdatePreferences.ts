import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdatePreferencesInput } from "@/core/domain/schema/auth.schema";
import { DEFAULT_USER_PREFERENCES } from "@/core/domain/schema/auth.schema";

import { updateUser } from "@/core/usecases/auth/updateUser";

import { authRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

import { useSession } from "./useSession";

/**
 * Hook for updating user preferences (dark mode, notifications, language).
 * Merges partial input with current session preferences before persisting
 * to Supabase user_metadata to avoid losing unmodified fields.
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
      const mergedPreferences = { ...currentPreferences, ...input };

      return updateUser(authRepository, {
        data: { preferences: mergedPreferences },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
};
