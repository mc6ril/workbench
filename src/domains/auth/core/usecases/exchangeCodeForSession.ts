import type { AuthRepository } from "@/domains/auth/core/ports/authRepository";

/**
 * Exchange an authorization code for a session (PKCE flow).
 * Used during OAuth/magic-link callback.
 *
 * @param repository - Auth repository
 * @param code - Authorization code from the callback URL
 * @throws AuthenticationFailure if code exchange fails
 */
export const exchangeCodeForSession = async (
  repository: AuthRepository,
  code: string
): Promise<void> => {
  await repository.exchangeCodeForSession(code);
};
