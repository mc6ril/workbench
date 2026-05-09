import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CurrentAuthIdentity } from "@/domains/auth/core/domain/auth.types";
import { queryKeys as authQueryKeys } from "@/domains/auth/presentation/hooks/identity/queryKeys";
import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import { DEFAULT_USER_PREFERENCES } from "@/domains/profile/core/domain/profile.types";
import {
  updatePreferences,
  type UpdatePreferencesInput,
} from "@/domains/profile/core/usecases/updatePreferences";
import { profileGateway } from "@/domains/profile/infrastructure/profileGateway.browser";

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  const { data: identity } = useAuthIdentity();
  const currentPreferences = identity?.preferences ?? DEFAULT_USER_PREFERENCES;

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
        queryClient.setQueryData<CurrentAuthIdentity | null>(
          authQueryKeys.authIdentity.current(),
          (current) => {
            if (!current) return current;
            return {
              ...current,
              preferences: { ...currentPreferences, ...input },
            };
          }
        );
      }
    },
  });
};
