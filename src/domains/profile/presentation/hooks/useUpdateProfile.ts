import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateUser } from "@/domains/auth/core/usecases/user/updateUser";
import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import type { UpdateProfileInput } from "@/domains/profile/core/domain/userProfile.schema";
import { updateProfile } from "@/domains/profile/core/usecases/updateProfile";
import { userProfileRepository } from "@/domains/profile/infrastructure/userProfileRepository.browser";
import { queryKeys } from "@/domains/profile/presentation/hooks/queryKeys";
import { queryKeys as sessionQueryKeys } from "@/domains/session/presentation/hooks/queryKeys";
import { useSession } from "@/domains/session/presentation/hooks/useSession";

/**
 * Hook for updating user profile (display name) and optionally email.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput & { email?: string }) => {
      if (input.displayName !== undefined && session) {
        await updateProfile(userProfileRepository, session.userId, {
          displayName: input.displayName,
        });
      }

      if (input.email) {
        await updateUser(authRepository, { email: input.email });
      }
    },
    onSuccess: (_data, variables) => {
      if (variables.email) {
        queryClient.invalidateQueries({
          queryKey: sessionQueryKeys.session.current(),
        });
      }
      if (session) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.userProfiles.detail(session.userId),
        });
      }
    },
  });
};
