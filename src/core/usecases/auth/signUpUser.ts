import type { AuthResult } from "@/core/domain/auth.schema";
import { type SignUpInput, SignUpSchema } from "@/core/domain/auth.schema";

import type { AuthRepository } from "@/core/ports/authRepository";

/**
 * Sign up a new user.
 * Validates input and creates a new user account.
 *
 * @param repository - Auth repository
 * @param input - Signup credentials (email, password)
 * @returns Authentication result with session (or null session with requiresEmailVerification flag if email verification is required)
 * @throws AuthenticationFailure if signup fails (email already exists, weak password, etc.)
 */
export const signUpUser = async (
  repository: AuthRepository,
  input: SignUpInput
): Promise<AuthResult> => {
  // Validate input with Zod schema
  const validatedInput = SignUpSchema.parse(input);

  // Call repository to create user
  // Repository will return session if user is automatically logged in,
  // or null session with requiresEmailVerification: true if email verification is required
  return repository.signUp(validatedInput);
};
