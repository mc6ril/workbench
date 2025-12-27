import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { signOutUser } from "@/core/usecases/auth/signOutUser";

import { authRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for signing out the current user.
 * Clears the session and redirects to the landing page.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useSignOut = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => signOutUser(authRepository),
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

