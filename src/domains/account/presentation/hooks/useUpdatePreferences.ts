import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DEFAULT_USER_PREFERENCES } from "@/shared/user/userPreferences";

import {
  updatePreferences,
  type UpdatePreferencesInput,
} from "@/domains/account/core/usecases/updatePreferences";
import { accountGateway } from "@/domains/account/infrastructure/accountGateway.browser";
import type { CurrentAuthIdentity } from "@/domains/auth/core/domain/auth.types";
import { queryKeys as authQueryKeys } from "@/domains/auth/presentation/hooks/identity/queryKeys";
import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  const { data: identity } = useAuthIdentity();
  const currentPreferences = identity?.preferences ?? DEFAULT_USER_PREFERENCES;

  return useMutation({
    mutationFn: (input: UpdatePreferencesInput) => {
      return updatePreferences(
        accountGateway,
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
