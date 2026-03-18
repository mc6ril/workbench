import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { SignUpInput } from "@/domains/project-management/core/domain/schema/auth.schema";

import { signUpUser } from "@/domains/project-management/core/usecases/auth/signUpUser";

import { authRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for signing up a new user.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignUpInput) => signUpUser(authRepository, input),
    retry: false,
    onSuccess: () => {
      // Invalidate auth-related queries after successful signup
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      // Invalidate projects queries to ensure fresh data after signup
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
};
