import type { AuthResult } from "@/core/domain/schema/auth.schema";
import {
  type UpdatePasswordInput,
  UpdatePasswordSchema,
} from "@/core/domain/schema/auth.schema";

import type { AuthRepository } from "@/core/ports/authRepository";

/**
 * Update password using a reset token.
 * Validates input, verifies token, and updates user password.
 *
 * @param repository - Auth repository
 * @param input - Password update input (email, token, password)
 * @returns Authentication result with session (user is auto-logged in after password update)
 * @throws InvalidTokenError if token is invalid or expired
 * @throws PasswordResetError for other password reset errors
 * @throws AuthenticationFailure for other authentication errors
 */
export const updatePassword = async (
  repository: AuthRepository,
  input: UpdatePasswordInput
): Promise<AuthResult> => {
  // Validate input with Zod schema
  const validatedInput = UpdatePasswordSchema.parse(input);

  // Call repository to verify token and update password
  return repository.updatePassword(validatedInput);
};
