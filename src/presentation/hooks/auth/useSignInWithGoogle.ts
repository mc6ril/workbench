import { useMutation, useQueryClient } from "@tanstack/react-query";

import { signInWithGoogle } from "@/domains/project-management/core/usecases/auth/signInWithGoogle";

import { authRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for starting Google OAuth sign-in flow.
 */
export const useSignInWithGoogle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (redirectPath?: string) =>
      signInWithGoogle(authRepository, redirectPath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
};
