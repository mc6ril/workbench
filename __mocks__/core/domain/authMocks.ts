import type {
  AuthenticationError,
  AuthResult,
  AuthSession,
  EmailAlreadyExistsError,
  EmailVerificationError,
  InvalidCredentialsError,
  InvalidTokenError,
  PasswordResetError,
  SamePasswordError,
  SignInInput,
  SignUpInput,
  WeakPasswordError,
} from "@/domains/auth/core/domain/schema/auth.schema";
import { DEFAULT_USER_PREFERENCES } from "@/domains/auth/core/domain/schema/auth.schema";

/**
 * Mock authentication session for testing.
 */
export const mockAuthSession: AuthSession = {
  userId: "123e4567-e89b-12d3-a456-426614174000",
  email: "test@example.com",
  displayName: "Test User",
  avatarUrl: null,
  preferences: { ...DEFAULT_USER_PREFERENCES },
  accessToken: "mock-access-token",
  isSuperuser: false,
};

/**
 * Mock authentication result for testing.
 */
export const mockAuthResult: AuthResult = {
  session: mockAuthSession,
  requiresEmailVerification: false,
};

/**
 * Mock authentication result with email verification required.
 */
export const mockAuthResultWithEmailVerification: AuthResult = {
  session: null,
  requiresEmailVerification: true,
};

/**
 * Valid sign up input for testing.
 */
export const validSignUpInput: SignUpInput = {
  email: "test@example.com",
  password: "password123",
};

/**
 * Valid sign in input for testing.
 */
export const validSignInInput: SignInInput = {
  email: "test@example.com",
  password: "password123",
};

/**
 * Valid reset password input for testing.
 */
export const validResetPasswordInput = {
  email: "test@example.com",
};

/**
 * Valid update password input for testing (legacy token flow).
 */
export const validUpdatePasswordInput = {
  email: "test@example.com",
  token: "valid-reset-token",
  password: "newpassword123",
};

/**
 * Valid update password input for testing (PKCE session-based flow, no token needed).
 */
export const validUpdatePasswordInputPkce = {
  password: "newpassword123",
};

/**
 * Valid verify email input for testing.
 */
export const validVerifyEmailInput = {
  email: "test@example.com",
  token: "valid-verification-token",
};

/**
 * Valid email for testing.
 */
export const validEmail = "test@example.com";

/**
 * Factory for creating authentication errors.
 * These mocks use debugMessage for logging purposes only.
 * User-facing messages should be translated in the presentation layer using i18n.
 */
export const createAuthError = {
  /**
   * Create an AuthenticationError.
   */
  authentication: (
    debugMessage: string = "Authentication failed"
  ): AuthenticationError => ({
    code: "AUTHENTICATION_ERROR",
    debugMessage,
  }),

  /**
   * Create an EmailAlreadyExistsError.
   */
  emailAlreadyExists: (
    debugMessage: string = "Email already registered"
  ): EmailAlreadyExistsError => ({
    code: "EMAIL_ALREADY_EXISTS",
    debugMessage,
  }),

  /**
   * Create an EmailVerificationError.
   */
  emailVerification: (
    debugMessage: string = "Email verification failed"
  ): EmailVerificationError => ({
    code: "EMAIL_VERIFICATION_ERROR",
    debugMessage,
  }),

  /**
   * Create an InvalidCredentialsError.
   */
  invalidCredentials: (
    debugMessage: string = "Invalid email or password"
  ): InvalidCredentialsError => ({
    code: "INVALID_CREDENTIALS",
    debugMessage,
  }),

  /**
   * Create an InvalidTokenError.
   */
  invalidToken: (
    debugMessage: string = "Token is invalid or expired"
  ): InvalidTokenError => ({
    code: "INVALID_TOKEN",
    debugMessage,
  }),

  /**
   * Create a PasswordResetError.
   */
  passwordReset: (
    debugMessage: string = "Password reset failed"
  ): PasswordResetError => ({
    code: "PASSWORD_RESET_ERROR",
    debugMessage,
  }),

  /**
   * Create a WeakPasswordError.
   */
  weakPassword: (
    debugMessage: string = "Password is too weak"
  ): WeakPasswordError => ({
    code: "WEAK_PASSWORD",
    debugMessage,
  }),

  /**
   * Create a SamePasswordError.
   */
  samePassword: (
    debugMessage: string = "New password should be different"
  ): SamePasswordError => ({
    code: "SAME_PASSWORD",
    debugMessage,
  }),
};
