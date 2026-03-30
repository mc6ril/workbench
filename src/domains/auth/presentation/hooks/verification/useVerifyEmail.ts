import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { VerifyEmailInput } from "@/domains/auth/core/domain/auth.types";
import { verifyEmail } from "@/domains/auth/core/usecases/verifyEmail";
import { authGateway } from "@/domains/auth/infrastructure/supabase/repositories";
import { invalidatePostAuthMutation } from "@/domains/auth/presentation/utils/invalidatePostAuthMutation";

/**
 * Hook for verifying email address using a verification token.
 */
export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VerifyEmailInput) => verifyEmail(authGateway, input),
    onSuccess: async () => {
      await invalidatePostAuthMutation(queryClient, { includeProjects: true });
    },
  });
};
