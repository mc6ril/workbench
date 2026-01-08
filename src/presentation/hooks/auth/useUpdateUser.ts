import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdateUserInput } from "@/core/domain/schema/auth.schema";

import { updateUser } from "@/core/usecases/auth/updateUser";

import { authRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for updating user information.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateUserInput) => updateUser(authRepository, input),
    onSuccess: () => {
      // Invalidate auth-related queries to refresh user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
};
