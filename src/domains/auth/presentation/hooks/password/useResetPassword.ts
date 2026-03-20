import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ResetPasswordInput } from "@/domains/auth/core/domain/auth.schema";
import { resetPasswordForEmail } from "@/domains/auth/core/usecases/password/resetPasswordForEmail";
import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { invalidateAuthQueries } from "@/domains/auth/presentation/hooks/invalidateAuthQueries";

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
      await invalidateAuthQueries(queryClient);
    },
  });
};
