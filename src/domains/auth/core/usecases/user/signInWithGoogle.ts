import type { AuthRepository } from "@/domains/auth/core/ports/authRepository";

/**
 * Start Google OAuth sign-in flow.
 * Delegates provider-specific details to the authentication repository.
 *
 * @param repository - Auth repository
 * @param redirectPath - Internal path to redirect after auth callback
 */
export const signInWithGoogle = async (
  repository: AuthRepository,
  redirectPath?: string
): Promise<void> => {
  if (!repository.signInWithGoogle) {
    throw new Error("Google OAuth is not available in this auth repository.");
  }

  await repository.signInWithGoogle(redirectPath);
};
