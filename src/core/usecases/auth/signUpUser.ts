import type { AuthResult } from "@/core/domain/auth/auth.schema";
import { type SignUpInput, SignUpSchema } from "@/core/domain/auth/auth.schema";

import type { AuthRepository } from "@/core/ports/authRepository";

/**
 * Sign up a new user.
 * Validates input and creates a new user account.
 *
 * @param repository - Auth repository
 * @param input - Signup credentials (email, password)
 * @returns Authentication result with session
 * @throws AuthenticationFailure if signup fails (email already exists, weak password, etc.)
 */
export async function signUpUser(
  repository: AuthRepository,
  input: SignUpInput
): Promise<AuthResult> {
  // Validate input with Zod schema
  const validatedInput = SignUpSchema.parse(input);

  // Call repository to create user
  return repository.signUp(validatedInput);
}
