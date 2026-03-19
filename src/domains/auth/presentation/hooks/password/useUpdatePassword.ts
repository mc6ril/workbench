import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdatePasswordInput } from "@/domains/auth/core/domain/schema/auth.schema";
import { updatePassword } from "@/domains/auth/core/usecases/password/updatePassword";
import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/auth/presentation/hooks/queryKeys";

/**
 * Hook for updating password using a reset token.
 */
export const useUpdatePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePasswordInput) =>
      updatePassword(authRepository, input),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
};
