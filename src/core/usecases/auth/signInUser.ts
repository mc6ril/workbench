import type { AuthResult } from "@/core/domain/auth/auth.schema";
import { type SignInInput, SignInSchema } from "@/core/domain/auth/auth.schema";

import type { AuthRepository } from "@/core/ports/authRepository";

/**
 * Sign in an existing user.
 * Validates input and authenticates the user.
 *
 * @param repository - Auth repository
 * @param input - Signin credentials (email, password)
 * @returns Authentication result with session
 * @throws InvalidCredentialsError if credentials are invalid
 * @throws AuthenticationFailure for other authentication errors
 */
export async function signInUser(
  repository: AuthRepository,
  input: SignInInput
): Promise<AuthResult> {
  // Validate input with Zod schema
  const validatedInput = SignInSchema.parse(input);

  // Call repository to authenticate user
  return repository.signIn(validatedInput);
}
