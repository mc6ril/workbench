import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys as profileQueryKeys } from "@/domains/profile/presentation/hooks/queryKeys";
import { queryKeys as sessionQueryKeys } from "@/domains/session/presentation/hooks/queryKeys";
import { useSession } from "@/domains/session/presentation/hooks/useSession";
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
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (input: UpdateAccountIdentityInput) => {
      await updateAccountIdentity(
        accountIdentityGateway,
        session?.userId,
        input
      );
    },
    onSuccess: (_data, variables) => {
      if (variables.email) {
        queryClient.invalidateQueries({
          queryKey: sessionQueryKeys.session.current(),
        });
      }

      if (session) {
        queryClient.invalidateQueries({
          queryKey: profileQueryKeys.userProfiles.detail(session.userId),
        });
      }
    },
  });
};
