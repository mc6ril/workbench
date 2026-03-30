import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateCredentials } from "@/domains/auth/core/usecases/user/updateCredentials";
import { authGateway } from "@/domains/auth/infrastructure/supabase/repositories";
import { invalidatePostAuthMutation } from "@/domains/auth/presentation/utils/invalidatePostAuthMutation";

/**
 * Hook for changing user password from account settings.
 */
export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newPassword: string) =>
      updateCredentials(authGateway, { password: newPassword }),
    onSuccess: async () => {
      await invalidatePostAuthMutation(queryClient);
    },
  });
};
