import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ResetPasswordInput } from "@/domains/auth/core/domain/auth.schema";
import { resetPasswordForEmail } from "@/domains/auth/core/usecases/password/resetPasswordForEmail";
import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { invalidatePostAuthMutation } from "@/domains/auth/presentation/utils/invalidatePostAuthMutation";

/**
 * Hook for requesting a password reset email.
 */
export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ResetPasswordInput) =>
      resetPasswordForEmail(authRepository, input),
    retry: false,
    onSuccess: async () => {
      await invalidatePostAuthMutation(queryClient);
    },
  });
};
