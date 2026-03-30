import type { AuthGateway } from "@/domains/auth/core/ports/auth.gateway";

/**
 * Start Google OAuth sign-in flow.
 * Delegates provider-specific details to the authentication repository.
 *
 * @param repository - Auth repository
 * @param redirectPath - Internal path to redirect after auth callback
 */
export const signInWithGoogle = async (
  gateway: AuthGateway,
  redirectPath?: string
): Promise<void> => {
  if (!gateway.signInWithGoogle) {
    throw new Error("Google OAuth is not available in this auth gateway.");
  }

  await gateway.signInWithGoogle(redirectPath);
};
