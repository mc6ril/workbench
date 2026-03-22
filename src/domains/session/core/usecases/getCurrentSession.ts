import { createNotFoundError } from "@/shared/errors/repositoryError";

import type { CurrentSession } from "@/domains/session/core/domain/currentSession.schema";
import type { SessionRepository } from "@/domains/session/core/ports/sessionRepository";

/**
 * Get the current user session.
 * Throws NotFoundError if no session exists.
 */
export const getCurrentSession = async (
  repository: SessionRepository
): Promise<CurrentSession> => {
  const session = await repository.getCurrentSession();

  if (!session) {
    throw createNotFoundError("Session", "");
  }

  return session;
};
