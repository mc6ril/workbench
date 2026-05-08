import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys as authIdentityQueryKeys } from "@/domains/auth/presentation/hooks/identity/queryKeys";
import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import { queryKeys as profileQueryKeys } from "@/domains/profile/presentation/hooks/queryKeys";
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

      if (identity) {
        queryClient.invalidateQueries({
          queryKey: profileQueryKeys.userProfiles.detail(identity.userId),
        });
      }
    },
  });
};
