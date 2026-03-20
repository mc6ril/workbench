import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateUser } from "@/domains/auth/core/usecases/user/updateUser";
import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { invalidateAuthQueries } from "@/domains/auth/presentation/hooks/invalidateAuthQueries";

/**
 * Hook for changing user password from account settings.
 */
export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newPassword: string) =>
      updateUser(authRepository, { password: newPassword }),
    onSuccess: async () => {
      await invalidateAuthQueries(queryClient);
    },
  });
};
