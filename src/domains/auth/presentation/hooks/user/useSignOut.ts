import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { PAGE_ROUTES } from "@/shared/constants/routes";

import { signOutUser } from "@/domains/auth/core/usecases/user/signOutUser";
import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/auth/presentation/hooks/queryKeys";

/**
 * Hook for signing out the current user.
 * Clears the session and redirects to the landing page.
 */
export const useSignOut = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => signOutUser(authRepository),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      queryClient.clear();
      router.push(PAGE_ROUTES.HOME);
    },
  });
};
