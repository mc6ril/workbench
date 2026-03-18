import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { SignInInput } from "@/domains/project-management/core/domain/schema/auth.schema";

import { signInUser } from "@/domains/project-management/core/usecases/auth/signInUser";

import { authRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

import { queryKeys } from "@/domains/project-management/presentation/hooks/queryKeys";

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
    onSuccess: () => {
      // Invalidate auth-related queries after successful signin
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
};
