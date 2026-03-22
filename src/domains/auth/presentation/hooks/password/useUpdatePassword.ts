import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdatePasswordInput } from "@/domains/auth/core/domain/auth.schema";
import { updatePassword } from "@/domains/auth/core/usecases/password/updatePassword";
import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { invalidatePostAuthMutation } from "@/domains/auth/presentation/utils/invalidatePostAuthMutation";

/**
 * Hook for updating password using a reset token.
 */
export const useUpdatePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePasswordInput) =>
      updatePassword(authRepository, input),
    retry: false,
    onSuccess: async () => {
      await invalidatePostAuthMutation(queryClient, { includeProjects: true });
    },
  });
};
