import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import {
  updateProfile,
  type UpdateProfileInput,
} from "@/domains/profile/core/usecases/updateProfile";
import { profileGateway } from "@/domains/profile/infrastructure/profileGateway.browser";
import { queryKeys } from "@/domains/profile/presentation/hooks/queryKeys";

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
    onSuccess: () => {
      if (identity) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.userProfiles.detail(identity.userId),
        });
      }
    },
  });
};
