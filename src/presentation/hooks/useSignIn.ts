import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { SignInInput } from "@/core/domain/auth/auth.schema";

import { signInUser } from "@/core/usecases/auth/signInUser";

import { authRepositorySupabase } from "@/infrastructure/supabase/repositories/authRepositorySupabase";

import { queryKeys } from "./queryKeys";

/**
 * Hook for signing in an existing user.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignInInput) =>
      signInUser(authRepositorySupabase, input),
    onSuccess: () => {
      // Invalidate auth-related queries after successful signin
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
};
