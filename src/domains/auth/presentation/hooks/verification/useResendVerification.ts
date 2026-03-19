import { useMutation, useQueryClient } from "@tanstack/react-query";

import { resendVerificationEmail } from "@/domains/auth/core/usecases/resendVerificationEmail";
import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/auth/presentation/hooks/queryKeys";

/**
 * Hook for resending verification email.
 */
export const useResendVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) =>
      resendVerificationEmail(authRepository, email),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
};
