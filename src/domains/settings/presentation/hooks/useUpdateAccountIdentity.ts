import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CurrentAuthIdentity } from "@/domains/auth/core/domain/auth.types";
import { queryKeys as authIdentityQueryKeys } from "@/domains/auth/presentation/hooks/identity/queryKeys";
import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import {
  updateAccountIdentity,
  type UpdateAccountIdentityInput,
} from "@/domains/settings/core/usecases/updateAccountIdentity";
import { accountIdentityGateway } from "@/domains/settings/infrastructure/accountIdentity.gateway";

/**
 * Hook for updating account identity fields from the account settings screen.
 */
export const useUpdateAccountIdentity = () => {
  const queryClient = useQueryClient();
  const { data: identity } = useAuthIdentity();

  return useMutation({
    mutationFn: async (input: UpdateAccountIdentityInput) => {
      await updateAccountIdentity(
        accountIdentityGateway,
        identity?.userId,
        input
      );
    },
    onSuccess: (_data, variables) => {
      if (variables.email) {
        queryClient.invalidateQueries({
          queryKey: authIdentityQueryKeys.authIdentity.current(),
        });
      }

      if (identity && variables.displayName !== undefined) {
        queryClient.setQueryData<CurrentAuthIdentity | null>(
          authIdentityQueryKeys.authIdentity.current(),
          (current) => {
            if (!current) return current;
            return {
              ...current,
              displayName: variables.displayName?.trim() || null,
            };
          }
        );
      }
    },
  });
};
