import type {
  AuthResult,
  AuthSession,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
  UpdatePasswordInput,
  VerifyEmailInput,
} from "@/core/domain/auth.schema";

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
   * Update password using a reset token.
   * @param input - Password update input (email, token, password)
   * @returns Authentication result with session (user is auto-logged in after password update)
   * @throws InvalidTokenError if token is invalid or expired
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
   * Update user information.
   * @param input - User update input (email, password, or data - all optional)
   * @throws AuthenticationFailure if update fails
   */
  updateUser(input: {
    email?: string;
    password?: string;
    data?: Record<string, unknown>;
  }): Promise<void>;

  /**
   * Delete the current user account.
   * Permanently deletes the user account and all associated data.
   * @throws AuthenticationFailure if deletion fails
   */
  deleteUser(): Promise<void>;
};
