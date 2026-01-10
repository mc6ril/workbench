import { createNotFoundError } from "@/core/domain/repositoryError";
import type { AuthSession } from "@/core/domain/schema/auth.schema";

import type { AuthRepository } from "@/core/ports/authRepository";

/**
 * Get the current user session.
 * Throws NotFoundError if no session exists (user not authenticated).
 *
 * @param repository - Auth repository
 * @returns Current session
 * @throws NotFoundError if no session exists (user not authenticated)
 * @throws DatabaseError if session retrieval fails
 */
export const getCurrentSession = async (
  repository: AuthRepository
): Promise<AuthSession> => {
  // Fetch session from repository
  const session = await repository.getSession();

  // Throw NotFoundError if no session exists
  if (!session) {
    throw createNotFoundError("Session", "");
  }

  return session;
};
