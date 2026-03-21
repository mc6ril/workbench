import { useMutation, useQueryClient } from "@tanstack/react-query";

import { signInWithGoogle } from "@/domains/auth/core/usecases/user/signInWithGoogle";
import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { invalidatePostAuthMutation } from "@/domains/auth/presentation/utils/invalidatePostAuthMutation";

/**
 * Hook for starting Google OAuth sign-in flow.
 */
export const useSignInWithGoogle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (redirectPath?: string) =>
      signInWithGoogle(authRepository, redirectPath),
    onSuccess: async () => {
      await invalidatePostAuthMutation(queryClient);
    },
  });
};
