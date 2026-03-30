import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateCredentials } from "@/domains/auth/core/usecases/user/updateCredentials";
import { authGateway } from "@/domains/auth/infrastructure/supabase/repositories";
import {
  updateProfile,
  type UpdateProfileInput,
} from "@/domains/profile/core/usecases/updateProfile";
import { profileGateway } from "@/domains/profile/infrastructure/profileGateway.browser";
import { queryKeys as profileQueryKeys } from "@/domains/profile/presentation/hooks/queryKeys";
import { queryKeys as sessionQueryKeys } from "@/domains/session/presentation/hooks/queryKeys";
import { useSession } from "@/domains/session/presentation/hooks/useSession";

type UpdateAccountProfileInput = UpdateProfileInput & {
  email?: string;
};

/**
 * Settings composes profile-owned and auth-owned updates for the account screen.
 */
export const useUpdateAccountProfile = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (input: UpdateAccountProfileInput) => {
      if (input.displayName !== undefined && session) {
        await updateProfile(profileGateway, session.userId, {
          displayName: input.displayName,
        });
      }

      if (input.email) {
        await updateCredentials(authGateway, { email: input.email });
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
          queryKey: profileQueryKeys.userProfiles.detail(session.userId),
        });
      }
    },
  });
};
