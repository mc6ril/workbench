import type { AuthRepository } from "@/core/ports/authRepository";

/**
 * Sign out the current user.
 * Clears the current session.
 *
 * @param repository - Auth repository
 * @throws AuthenticationFailure if signout fails
 */
export async function signOutUser(repository: AuthRepository): Promise<void> {
  return repository.signOut();
}
