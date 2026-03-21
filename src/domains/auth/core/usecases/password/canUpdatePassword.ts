import type { AuthRepository } from "@/domains/auth/core/ports/authRepository";

/**
 * Returns whether the current authenticated user can update a password.
 */
export const canUpdatePassword = async (
  repository: AuthRepository
): Promise<boolean> => {
  return repository.canUpdatePassword();
};
