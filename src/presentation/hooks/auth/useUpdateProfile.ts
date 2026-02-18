import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdateProfileInput } from "@/core/domain/schema/auth.schema";

import { updateUser } from "@/core/usecases/auth/updateUser";

import { authRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for updating user profile (display name and email).
 * Maps UpdateProfileInput to the underlying updateUser usecase,
 * storing display name in Supabase user_metadata.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      updateUser(authRepository, {
        email: input.email || undefined,
        data: input.displayName
          ? { display_name: input.displayName }
          : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
};
