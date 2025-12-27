import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteUser } from "@/core/usecases/auth/deleteUser";

import { authRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for deleting the current user account.
 * Permanently deletes the user account and redirects to the landing page.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => deleteUser(authRepository),
    onSuccess: () => {
      // Invalidate all auth-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      // Clear all queries
      queryClient.clear();
      // Redirect to landing page
      router.push("/");
    },
  });
};

