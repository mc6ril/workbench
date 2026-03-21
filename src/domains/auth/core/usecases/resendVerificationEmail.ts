import { ResendVerificationEmailSchema } from "@/domains/auth/core/domain/auth.schema";
import type { AuthRepository } from "@/domains/auth/core/ports/authRepository";

/**
 * Resend verification email to a user.
 * Validates input and resends verification email.
 *
 * @param repository - Auth repository
 * @param email - Email address to resend verification to
 * @throws ZodError if email validation fails
 * @throws EmailVerificationError if resend fails
 * @throws AuthenticationFailure for other authentication errors
 */
export const resendVerificationEmail = async (
  repository: AuthRepository,
  email: string
): Promise<void> => {
  // Validate input with Zod schema
  const validatedInput = ResendVerificationEmailSchema.parse({ email });

  // Call repository to resend verification email
  return repository.resendVerificationEmail(validatedInput.email);
};
