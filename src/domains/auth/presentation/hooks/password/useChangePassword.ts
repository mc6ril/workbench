import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateUser } from "@/domains/auth/core/usecases/user/updateUser";
import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { invalidatePostAuthMutation } from "@/domains/auth/presentation/utils/invalidatePostAuthMutation";

/**
 * Hook for changing user password from account settings.
 */
export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newPassword: string) =>
      updateUser(authRepository, { password: newPassword }),
    onSuccess: async () => {
      await invalidatePostAuthMutation(queryClient);
    },
  });
};
