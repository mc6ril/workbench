import type { AuthRepository } from "@/domains/project-management/core/ports/authRepository";

/**
 * Sign out the current user.
 * Clears the current session.
 *
 * @param repository - Auth repository
 * @throws AuthenticationFailure if signout fails
 */
export const signOutUser = async (
  repository: AuthRepository
): Promise<void> => {
  return repository.signOut();
};
