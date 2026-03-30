import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateProfile,
  type UpdateProfileInput,
} from "@/domains/profile/core/usecases/updateProfile";
import { profileGateway } from "@/domains/profile/infrastructure/profileGateway.browser";
import { queryKeys } from "@/domains/profile/presentation/hooks/queryKeys";
import { useSession } from "@/domains/session/presentation/hooks/useSession";

/**
 * Hook for updating user profile data owned by the profile domain.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      if (input.displayName !== undefined && session) {
        await updateProfile(profileGateway, session.userId, {
          displayName: input.displayName,
        });
      }
    },
    onSuccess: () => {
      if (session) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.userProfiles.detail(session.userId),
        });
      }
    },
  });
};
