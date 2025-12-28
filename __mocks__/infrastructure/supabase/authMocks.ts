import type { Session, User } from "@supabase/supabase-js";

type SessionOverrides = {
  user?: Partial<User>;
} & Omit<Partial<Session>, "user">;

/**
 * Creates a mock Supabase Session for testing.
 *
 * @param overrides - Partial Session object to override default values
 * @returns Mock Supabase Session
 */
export const createSupabaseSessionMock = (
  overrides: SessionOverrides = {}
): Session => {
  const defaultSession: Session = {
    access_token: "test-access-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: 1234567890,
    refresh_token: "test-refresh-token",
    user: {
      id: "user-123",
      email: "test@example.com",
      aud: "authenticated",
      role: "authenticated",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      app_metadata: {},
      user_metadata: {},
    },
  };

  return {
    ...defaultSession,
    ...overrides,
    user: {
      ...defaultSession.user,
      ...(overrides.user || {}),
    } as User,
  };
};

/**
 * Factory for creating Supabase Auth error objects for testing.
 */
export const createSupabaseAuthError = {
  /**
   * Create a Supabase auth error with email_not_confirmed code.
   */
  emailNotConfirmed: (
    message: string = "Email not confirmed"
  ): {
    code: string;
    message: string;
    status: number;
  } => ({
    code: "email_not_confirmed",
    message,
    status: 400,
  }),

  /**
   * Create a Supabase auth error for invalid credentials.
   */
  invalidCredentials: (
    message: string = "Invalid login credentials"
  ): {
    message: string;
    status: number;
  } => ({
    message,
    status: 400,
  }),

  /**
   * Create a Supabase auth error with invalid_credentials code.
   */
  invalidCredentialsCode: (
    message: string = "Invalid credentials"
  ): {
    code: string;
    message: string;
    status: number;
  } => ({
    code: "invalid_credentials",
    message,
    status: 400,
  }),

  /**
   * Create a Supabase auth error for email already exists.
   */
  emailAlreadyExists: (
    message: string = "User already registered"
  ): {
    message: string;
    status: number;
  } => ({
    message,
    status: 400,
  }),

  /**
   * Create a Supabase auth error with signup_disabled code.
   */
  signupDisabled: (
    message: string = "Signup is disabled"
  ): {
    code: string;
    message: string;
    status: number;
  } => ({
    code: "signup_disabled",
    message,
    status: 400,
  }),

  /**
   * Create a Supabase auth error for weak password.
   */
  weakPassword: (
    message: string = "Password is too weak"
  ): {
    message: string;
    status: number;
  } => ({
    message,
    status: 400,
  }),

  /**
   * Create a Supabase auth error for invalid email format.
   */
  invalidEmail: (
    message: string = "Invalid email"
  ): {
    message: string;
    status: number;
  } => ({
    message,
    status: 400,
  }),

  /**
   * Create a Supabase auth error with validation_failed code.
   */
  validationFailed: (
    message: string = "Validation failed"
  ): {
    code: string;
    message: string;
    status: number;
  } => ({
    code: "validation_failed",
    message,
    status: 400,
  }),

  /**
   * Create a Supabase auth error for email verification.
   */
  emailVerification: (
    message: string = "Email verification failed"
  ): {
    message: string;
    status: number;
  } => ({
    message,
    status: 400,
  }),

  /**
   * Create a Supabase auth error with token_expired code.
   */
  tokenExpired: (
    message: string = "Token expired"
  ): {
    code: string;
    message: string;
    status: number;
  } => ({
    code: "token_expired",
    message,
    status: 400,
  }),

  /**
   * Create a Supabase auth error for password reset.
   */
  passwordReset: (
    message: string = "Password reset failed"
  ): {
    message: string;
    status: number;
  } => ({
    message,
    status: 400,
  }),

  /**
   * Create a Supabase auth error with email_not_found code.
   */
  emailNotFound: (
    message: string = "Email not found"
  ): {
    code: string;
    message: string;
    status: number;
  } => ({
    code: "email_not_found",
    message,
    status: 400,
  }),

  /**
   * Create a Supabase auth error with invalid_token code.
   */
  invalidToken: (
    message: string = "Invalid token"
  ): {
    code: string;
    message: string;
    status: number;
  } => ({
    code: "invalid_token",
    message,
    status: 400,
  }),

  /**
   * Create a generic Supabase auth error.
   */
  generic: (
    message: string = "Unknown error",
    status: number = 500
  ): {
    message: string;
    status: number;
  } => ({
    message,
    status,
  }),
};
