import {
  type ResetPasswordInput,
  ResetPasswordSchema,
} from "@/core/domain/auth.schema";

import type { AuthRepository } from "@/core/ports/authRepository";

/**
 * Request a password reset email.
 * Validates input and sends password reset email to the user.
 *
 * @param repository - Auth repository
 * @param input - Password reset request (email)
 * @throws PasswordResetError if email not found or reset fails
 * @throws AuthenticationFailure for other authentication errors
 */
export const resetPasswordForEmail = async (
  repository: AuthRepository,
  input: ResetPasswordInput
): Promise<void> => {
  // Validate input with Zod schema
  const validatedInput = ResetPasswordSchema.parse(input);

  // Call repository to send password reset email
  return repository.resetPasswordForEmail(validatedInput);
};
