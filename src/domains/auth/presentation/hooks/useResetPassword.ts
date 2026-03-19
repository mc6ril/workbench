import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ResetPasswordInput } from "@/domains/auth/core/domain/schema/auth.schema";
import { resetPasswordForEmail } from "@/domains/auth/core/usecases/resetPasswordForEmail";
import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/auth/presentation/hooks/queryKeys";

/**
 * Hook for requesting a password reset email.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ResetPasswordInput) =>
      resetPasswordForEmail(authRepository, input),
    retry: false,
    onSuccess: () => {
      // Invalidate auth-related queries after successful password reset request
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
};
