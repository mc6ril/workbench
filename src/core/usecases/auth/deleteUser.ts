import type { AuthRepository } from "@/core/ports/authRepository";

/**
 * Delete the current user account.
 * Permanently deletes the user account and all associated data.
 *
 * @param repository - Auth repository
 * @throws AuthenticationFailure if deletion fails
 */
export async function deleteUser(repository: AuthRepository): Promise<void> {
  return repository.deleteUser();
}
