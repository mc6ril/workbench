import type {
  AuthResult,
  AuthSession,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
  UpdatePasswordInput,
  VerifyEmailInput,
} from "@/core/domain/schema/auth.schema";

/**
 * Repository contract for Authentication operations.
 * Hides infrastructure details (Supabase) and exposes domain-shaped operations.
 */
export type AuthRepository = {
  /**
   * Sign up a new user.
   * @param input - Signup credentials (email, password)
   * @returns Authentication result with session (or null session with requiresEmailVerification flag if email verification is required)
   * @throws AuthenticationFailure if signup fails (email already exists, weak password, etc.)
   */
  signUp(input: SignUpInput): Promise<AuthResult>;

  /**
   * Sign in an existing user.
   * @param input - Signin credentials (email, password)
   * @returns Authentication result with session (always returns a session for successful signin)
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

  /**
   * Request a password reset email.
   * @param input - Password reset request (email)
   * @throws PasswordResetError if email not found or reset fails
   * @throws AuthenticationFailure for other authentication errors
   */
  resetPasswordForEmail(input: ResetPasswordInput): Promise<void>;

  /**
   * Update password after a password reset.
   * Supports PKCE flow (session-based, no token needed) and legacy token flow.
   * @param input - Password update input (password required; token and email optional)
   * @returns Authentication result with session (user is auto-logged in after password update)
   * @throws InvalidTokenError if token/session is invalid or expired
   * @throws PasswordResetError for other password reset errors
   * @throws AuthenticationFailure for other authentication errors
   */
  updatePassword(input: UpdatePasswordInput): Promise<AuthResult>;

  /**
   * Verify email address using a verification token.
   * @param input - Email verification input (email, token)
   * @returns Authentication result with session (user is auto-logged in after verification)
   * @throws InvalidTokenError if token is invalid or expired
   * @throws EmailVerificationError for other verification errors
   * @throws AuthenticationFailure for other authentication errors
   */
  verifyEmail(input: VerifyEmailInput): Promise<AuthResult>;

  /**
   * Resend verification email.
   * @param email - Email address to resend verification to
   * @throws EmailVerificationError if resend fails
   * @throws AuthenticationFailure for other authentication errors
   */
  resendVerificationEmail(email: string): Promise<void>;

  /**
   * Update auth credentials (email and/or password).
   * Profile data (display_name, preferences) is managed via UserProfileRepository.
   * @param input - Auth credential update (email and/or password)
   * @throws AuthenticationFailure if update fails
   */
  updateUser(input: { email?: string; password?: string }): Promise<void>;

  /**
   * Delete the current user account.
   * Permanently deletes the user account and all associated data.
   * @throws AuthenticationFailure if deletion fails
   */
  deleteUser(): Promise<void>;

  /**
   * Exchange an authorization code for a session (PKCE flow).
   * Used during OAuth/magic-link callback to complete the auth handshake.
   * @param code - Authorization code from the callback URL
   * @throws AuthenticationFailure if code exchange fails
   */
  exchangeCodeForSession(code: string): Promise<void>;
};
