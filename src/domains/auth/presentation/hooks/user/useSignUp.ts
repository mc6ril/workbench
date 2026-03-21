import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { SignUpInput } from "@/domains/auth/core/domain/auth.schema";
import { signUpUser } from "@/domains/auth/core/usecases/user/signUpUser";
import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { invalidatePostAuthMutation } from "@/domains/auth/presentation/utils/invalidatePostAuthMutation";

/**
 * Hook for signing up a new user.
 */
export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignUpInput) => signUpUser(authRepository, input),
    retry: false,
    onSuccess: async () => {
      await invalidatePostAuthMutation(queryClient, { includeProjects: true });
    },
  });
};
