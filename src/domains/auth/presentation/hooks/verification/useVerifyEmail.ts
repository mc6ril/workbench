import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { VerifyEmailInput } from "@/domains/auth/core/domain/auth.schema";
import { verifyEmail } from "@/domains/auth/core/usecases/verifyEmail";
import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { invalidateAuthQueries } from "@/domains/auth/presentation/hooks/invalidateAuthQueries";

/**
 * Hook for verifying email address using a verification token.
 */
export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VerifyEmailInput) => verifyEmail(authRepository, input),
    onSuccess: async () => {
      await invalidateAuthQueries(queryClient, { includeProjects: true });
    },
  });
};
