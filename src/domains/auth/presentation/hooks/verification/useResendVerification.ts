import { useMutation, useQueryClient } from "@tanstack/react-query";

import { resendVerificationEmail } from "@/domains/auth/core/usecases/resendVerificationEmail";
import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { invalidatePostAuthMutation } from "@/domains/auth/presentation/utils/invalidatePostAuthMutation";

/**
 * Hook for resending verification email.
 */
export const useResendVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) =>
      resendVerificationEmail(authRepository, email),
    retry: false,
    onSuccess: async () => {
      await invalidatePostAuthMutation(queryClient);
    },
  });
};
