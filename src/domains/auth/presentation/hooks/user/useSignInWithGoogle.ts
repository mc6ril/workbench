import { useMutation, useQueryClient } from "@tanstack/react-query";

import { signInWithGoogle } from "@/domains/auth/core/usecases/user/signInWithGoogle";
import { authGateway } from "@/domains/auth/infrastructure/supabase/repositories";
import { invalidatePostAuthMutation } from "@/domains/auth/presentation/utils/invalidatePostAuthMutation";

/**
 * Hook for starting Google OAuth sign-in flow.
 */
export const useSignInWithGoogle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (redirectPath?: string) =>
      signInWithGoogle(authGateway, redirectPath),
    onSuccess: async () => {
      await invalidatePostAuthMutation(queryClient);
    },
  });
};
