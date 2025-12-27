import { z } from "zod";

import type { AuthRepository } from "@/core/ports/authRepository";

/**
 * Zod schema for resend verification email input.
 * Validates email format.
 */
const ResendVerificationEmailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

/**
 * Resend verification email to a user.
 * Validates input and resends verification email.
 *
 * @param repository - Auth repository
 * @param email - Email address to resend verification to
 * @throws EmailVerificationError if resend fails
 * @throws AuthenticationFailure for other authentication errors
 */
export async function resendVerificationEmail(
  repository: AuthRepository,
  email: string
): Promise<void> {
  // Validate input with Zod schema
  const validatedInput = ResendVerificationEmailSchema.parse({ email });

  // Call repository to resend verification email
  return repository.resendVerificationEmail(validatedInput.email);
}
