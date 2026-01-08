import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdatePasswordInput } from "@/core/domain/schema/auth.schema";

import { updatePassword } from "@/core/usecases/auth/updatePassword";

import { authRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for updating password using a reset token.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useUpdatePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePasswordInput) =>
      updatePassword(authRepository, input),
    onSuccess: () => {
      // Invalidate auth-related queries after successful password update
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
};
