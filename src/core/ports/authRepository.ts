import type {
  AuthResult,
  AuthSession,
  SignInInput,
  SignUpInput,
} from "@/core/domain/auth/auth.schema";

/**
 * Repository contract for Authentication operations.
 * Hides infrastructure details (Supabase) and exposes domain-shaped operations.
 */
export type AuthRepository = {
  /**
   * Sign up a new user.
   * @param input - Signup credentials (email, password)
   * @returns Authentication result with session
   * @throws AuthenticationFailure if signup fails (email already exists, weak password, etc.)
   */
  signUp(input: SignUpInput): Promise<AuthResult>;

  /**
   * Sign in an existing user.
   * @param input - Signin credentials (email, password)
   * @returns Authentication result with session
   * @throws InvalidCredentialsError if credentials are invalid
   * @throws AuthenticationFailure for other authentication errors
   */
  signIn(input: SignInInput): Promise<AuthResult>;

  /**
   * Sign out the current user.
   * Clears the current session.
   * @throws AuthenticationFailure if signout fails
   */
  signOut(): Promise<void>;

  /**
   * Get the current user session.
   * @returns Current session or null if no session exists
   * @throws AuthenticationFailure if session retrieval fails
   */
  getSession(): Promise<AuthSession | null>;
};
