import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { signOutUser } from "@/domains/auth/core/usecases/signOutUser";

import { PAGE_ROUTES } from "@/shared/constants/routes";

import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/auth/presentation/hooks/queryKeys";

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
      router.push(PAGE_ROUTES.HOME);
    },
  });
};
