import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { VerifyEmailInput } from "@/core/domain/auth.schema";

import { verifyEmail } from "@/core/usecases/auth/verifyEmail";

import { authRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for verifying email address using a verification token.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VerifyEmailInput) => verifyEmail(authRepository, input),
    onSuccess: () => {
      // Invalidate auth-related queries after successful email verification
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
};
