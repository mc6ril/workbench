import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CurrentAuthIdentity } from "@/domains/auth/core/domain/auth.types";
import { queryKeys as authQueryKeys } from "@/domains/auth/presentation/hooks/identity/queryKeys";
import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import {
  updateProfile,
  type UpdateProfileInput,
} from "@/domains/profile/core/usecases/updateProfile";
import { profileGateway } from "@/domains/profile/infrastructure/profileGateway.browser";

/**
 * Hook for updating user profile data owned by the profile domain.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { data: identity } = useAuthIdentity();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      if (input.displayName !== undefined && identity) {
        await updateProfile(profileGateway, identity.userId, {
          displayName: input.displayName,
        });
      }
    },
    onSuccess: (_data, input) => {
      if (identity && input.displayName !== undefined) {
        queryClient.setQueryData<CurrentAuthIdentity | null>(
          authQueryKeys.authIdentity.current(),
          (current) => {
            if (!current) return current;
            return { ...current, displayName: input.displayName ?? null };
          }
        );
      }
    },
  });
};
