import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { SignInInput } from "@/domains/auth/core/domain/auth.schema";
import { signInUser } from "@/domains/auth/core/usecases/user/signInUser";
import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { invalidatePostAuthMutation } from "@/domains/auth/presentation/utils/invalidatePostAuthMutation";

/**
 * Hook for signing in an existing user.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignInInput) => signInUser(authRepository, input),
    retry: false,
    onSuccess: async () => {
      await invalidatePostAuthMutation(queryClient, { includeProjects: true });
    },
  });
};
