import { createAppError } from "@/shared/errors/appError";
import { AUTH_ERROR_CODE } from "@/shared/errors/appErrorCodes";

import { mockCurrentSession } from "./sessionMocks";

import type {
  AuthenticationError,
  EmailAlreadyExistsError,
  EmailVerificationError,
  InvalidCredentialsError,
  InvalidTokenError,
  PasswordResetError,
  PasswordUpdateNotAllowedError,
  SamePasswordError,
  WeakPasswordError,
} from "@/domains/auth/core/domain/auth.errors";
import type {
  AuthResult,
  SignInInput,
  SignUpInput,
} from "@/domains/auth/core/domain/auth.types";

/**
 * Mock authentication result for testing.
 */
export const mockAuthResult: AuthResult = {
  session: mockCurrentSession,
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
  locale: "fr",
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
  ): AuthenticationError =>
    createAppError(AUTH_ERROR_CODE.AUTHENTICATION_ERROR, {
      debugMessage,
    }) as AuthenticationError,

  /**
   * Create an EmailAlreadyExistsError.
   */
  emailAlreadyExists: (
    debugMessage: string = "Email already registered"
  ): EmailAlreadyExistsError =>
    createAppError(AUTH_ERROR_CODE.EMAIL_ALREADY_EXISTS, {
      debugMessage,
    }) as EmailAlreadyExistsError,

  /**
   * Create an EmailVerificationError.
   */
  emailVerification: (
    debugMessage: string = "Email verification failed"
  ): EmailVerificationError =>
    createAppError(AUTH_ERROR_CODE.EMAIL_VERIFICATION_ERROR, {
      debugMessage,
    }) as EmailVerificationError,

  /**
   * Create an InvalidCredentialsError.
   */
  invalidCredentials: (
    debugMessage: string = "Invalid email or password"
  ): InvalidCredentialsError =>
    createAppError(AUTH_ERROR_CODE.INVALID_CREDENTIALS, {
      debugMessage,
    }) as InvalidCredentialsError,

  /**
   * Create an InvalidTokenError.
   */
  invalidToken: (
    debugMessage: string = "Token is invalid or expired"
  ): InvalidTokenError =>
    createAppError(AUTH_ERROR_CODE.INVALID_TOKEN, {
      debugMessage,
    }) as InvalidTokenError,

  /**
   * Create a PasswordResetError.
   */
  passwordReset: (
    debugMessage: string = "Password reset failed"
  ): PasswordResetError =>
    createAppError(AUTH_ERROR_CODE.PASSWORD_RESET_ERROR, {
      debugMessage,
    }) as PasswordResetError,

  /**
   * Create a WeakPasswordError.
   */
  weakPassword: (
    debugMessage: string = "Password is too weak"
  ): WeakPasswordError =>
    createAppError(AUTH_ERROR_CODE.WEAK_PASSWORD, {
      debugMessage,
    }) as WeakPasswordError,

  /**
   * Create a SamePasswordError.
   */
  samePassword: (
    debugMessage: string = "New password should be different"
  ): SamePasswordError =>
    createAppError(AUTH_ERROR_CODE.SAME_PASSWORD, {
      debugMessage,
    }) as SamePasswordError,

  /**
   * Create a PasswordUpdateNotAllowedError.
   */
  passwordUpdateNotAllowed: (
    debugMessage: string = "Password updates are not available for this account"
  ): PasswordUpdateNotAllowedError =>
    createAppError(AUTH_ERROR_CODE.PASSWORD_UPDATE_NOT_ALLOWED, {
      debugMessage,
    }) as PasswordUpdateNotAllowedError,
};
