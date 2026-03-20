import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateUser } from "@/domains/auth/core/usecases/user/updateUser";
import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { queryKeys as authQueryKeys } from "@/domains/auth/presentation/hooks/queryKeys";
import { useSession } from "@/domains/auth/presentation/hooks/session/useSession";
import type { UpdateProfileInput } from "@/domains/profile/core/domain/schema/userProfile.schema";
import { updateProfile } from "@/domains/profile/core/usecases/updateProfile";
import { userProfileRepository } from "@/domains/profile/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/profile/presentation/hooks/queryKeys";

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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.auth.session(),
      });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.auth.user(),
      });
      if (session) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.userProfiles.detail(session.userId),
        });
      }
    },
  });
};
