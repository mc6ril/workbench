import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdateProfileInput } from "@/domains/auth/core/domain/schema/userProfile.schema";
import { updateProfile } from "@/domains/auth/core/usecases/profile/updateProfile";
import { updateUser } from "@/domains/auth/core/usecases/user/updateUser";
import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { userProfileRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/auth/presentation/hooks/queryKeys";
import { useSession } from "@/domains/auth/presentation/hooks/session/useSession";

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
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      if (session) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.userProfiles.detail(session.userId),
        });
      }
    },
  });
};
