import type { AuthResult } from "@/core/domain/schema/auth.schema";
import {
  type VerifyEmailInput,
  VerifyEmailSchema,
} from "@/core/domain/schema/auth.schema";

import type { AuthRepository } from "@/core/ports/authRepository";

/**
 * Verify email address using a verification token.
 * Validates input and verifies the email token.
 *
 * @param repository - Auth repository
 * @param input - Email verification input (email, token)
 * @returns Authentication result with session (user is auto-logged in after verification)
 * @throws InvalidTokenError if token is invalid or expired
 * @throws EmailVerificationError for other verification errors
 * @throws AuthenticationFailure for other authentication errors
 */
export const verifyEmail = async (
  repository: AuthRepository,
  input: VerifyEmailInput
): Promise<AuthResult> => {
  // Validate input with Zod schema
  const validatedInput = VerifyEmailSchema.parse(input);

  // Call repository to verify email token
  return repository.verifyEmail(validatedInput);
};
