import type { AuthSession } from "@/core/domain/auth.schema";

import type { AuthRepository } from "@/core/ports/authRepository";

/**
 * Get the current user session.
 *
 * @param repository - Auth repository
 * @returns Current session or null if no session exists
 * @throws AuthenticationFailure if session retrieval fails
 */
export const getCurrentSession = async (
  repository: AuthRepository
): Promise<AuthSession | null> => {
  return repository.getSession();
};
