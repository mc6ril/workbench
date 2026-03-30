import { createNotFoundError } from "@/shared/errors/repositoryError";

import type { CurrentSession } from "@/domains/session/core/domain/session.types";
import type { SessionGateway } from "@/domains/session/core/ports/session.gateway";

/**
 * Get the current user session.
 * Throws NotFoundError if no session exists.
 */
export const getCurrentSession = async (
  gateway: SessionGateway
): Promise<CurrentSession> => {
  const session = await gateway.getCurrentSession();

  if (!session) {
    throw createNotFoundError("Session", "");
  }

  return session;
};
