import { useMutation, useQueryClient } from "@tanstack/react-query";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import {
  APP_COOKIE_KEYS,
  resetCookie,
} from "@/shared/infrastructure/storage/cookies";
import { navigateToDocumentPath } from "@/shared/navigation/documentNavigation";
import { clearPersistedIdentityCache } from "@/shared/providers/persistedIdentityCache";

import { signOutUser } from "@/domains/auth/core/usecases/user/signOutUser";
import { authGateway } from "@/domains/auth/infrastructure/supabase/repositories";
import { invalidatePostAuthMutation } from "@/domains/auth/presentation/utils/invalidatePostAuthMutation";

/**
 * Hook for signing out the current user.
 * Clears the session and redirects to the landing page.
 */
export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => signOutUser(authGateway),
    onSuccess: async () => {
      await invalidatePostAuthMutation(queryClient);
      clearPersistedIdentityCache();
      queryClient.clear();
      resetCookie(APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES);

      // Use a document navigation so middleware and server layouts re-evaluate
      // against the cleared auth cookies instead of reusing protected client state.
      navigateToDocumentPath(PAGE_ROUTES.HOME);
    },
  });
};
