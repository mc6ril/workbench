import type { AuthResult } from "@/domains/auth/core/domain/auth.schema";
import {
  type UpdatePasswordInput,
  UpdatePasswordSchema,
} from "@/domains/auth/core/domain/auth.schema";
import type { AuthRepository } from "@/domains/auth/core/ports/authRepository";

/**
 * Update password after a password reset.
 * Supports two flows:
 * - PKCE flow: session already established by auth callback, only password needed.
 * - Legacy token flow: email + token provided for OTP verification.
 *
 * @param repository - Auth repository
 * @param input - Password update input (password required; token and email optional)
 * @returns Authentication result with session (user is auto-logged in after password update)
 * @throws InvalidTokenError if token/session is invalid or expired
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
