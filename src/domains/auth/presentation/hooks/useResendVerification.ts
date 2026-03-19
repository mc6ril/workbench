import { useMutation, useQueryClient } from "@tanstack/react-query";

import { resendVerificationEmail } from "@/domains/auth/core/usecases/resendVerificationEmail";

import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/auth/presentation/hooks/queryKeys";

/**
 * Hook for resending verification email.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useResendVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) =>
      resendVerificationEmail(authRepository, email),
    retry: false,
    onSuccess: () => {
      // Invalidate auth-related queries after successful resend
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
};
