import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdatePasswordInput } from "@/domains/auth/core/domain/auth.types";
import { updatePassword } from "@/domains/auth/core/usecases/password/updatePassword";
import { authGateway } from "@/domains/auth/infrastructure/supabase/repositories";
import { invalidatePostAuthMutation } from "@/domains/auth/presentation/utils/invalidatePostAuthMutation";

/**
 * Hook for updating password using a reset token.
 */
export const useUpdatePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePasswordInput) =>
      updatePassword(authGateway, input),
    retry: false,
    onSuccess: async () => {
      await invalidatePostAuthMutation(queryClient, { includeProjects: true });
    },
  });
};
