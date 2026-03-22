import type { SessionRepository } from "@/domains/session/core/ports/sessionRepository";

/**
 * Returns whether the current authenticated user can update a password.
 */
export const canUpdatePassword = async (
  repository: SessionRepository
): Promise<boolean> => {
  return repository.canUpdatePassword();
};
