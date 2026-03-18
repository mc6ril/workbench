import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateUser } from "@/domains/project-management/core/usecases/auth/updateUser";

import { authRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

import { queryKeys } from "@/domains/project-management/presentation/hooks/queryKeys";

/**
 * Hook for changing user password from account settings.
 * Wraps the updateUser usecase with password-only input.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newPassword: string) =>
      updateUser(authRepository, { password: newPassword }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
};
