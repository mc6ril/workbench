import { useMutation, useQueryClient } from "@tanstack/react-query";

import { resendVerificationEmail } from "@/core/usecases/auth/resendVerificationEmail";

import { authRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

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
    onSuccess: () => {
      // Invalidate auth-related queries after successful resend
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
};
