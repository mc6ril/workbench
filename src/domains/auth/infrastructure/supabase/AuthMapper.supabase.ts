import type { Session } from "@supabase/supabase-js";

import { AUTH_ERROR_CODE } from "@/shared/constants/errorCodes";

import type {
  AuthenticationFailure,
  AuthSession,
  EmailAlreadyExistsError,
  EmailVerificationError,
  InvalidCredentialsError,
  InvalidEmailError,
  InvalidTokenError,
  PasswordResetError,
  SamePasswordError,
  WeakPasswordError,
} from "@/domains/auth/core/domain/schema/auth.schema";
import { DEFAULT_USER_PREFERENCES } from "@/domains/auth/core/domain/schema/auth.schema";

/**
 * Extracts the super user flag from Supabase app_metadata.
 * app_metadata is server-controlled and cannot be modified by the user.
 */
const extractSuperuserFlag = (
  appMetadata: Record<string, unknown> | undefined
): boolean => {
  return appMetadata?.is_superuser === true;
};

/**
 * Maps Supabase Session to a base AuthSession.
 * displayName and preferences are set to defaults here;
 * they are enriched from user_profiles by the repository.
 *
 * @param session - Supabase session
 * @param userEmail - User email from Supabase user object
 * @returns Base auth session (needs profile enrichment)
 */
export const mapSupabaseSessionToDomain = (
  session: Session,
  userEmail: string
): AuthSession => {
  return {
    userId: session.user.id,
    email: userEmail,
    displayName: null,
    avatarUrl: null,
    preferences: { ...DEFAULT_USER_PREFERENCES },
    accessToken: session.access_token,
    isSuperuser: extractSuperuserFlag(session.user.app_metadata),
  };
};

/**
 * Creates an invalid credentials error.
 */
const createInvalidCredentialsError = (
  debugMessage?: string
): InvalidCredentialsError => ({
  code: AUTH_ERROR_CODE.INVALID_CREDENTIALS,
  debugMessage,
});

/**
 * Creates an email already exists error.
 */
const createEmailAlreadyExistsError = (
  debugMessage?: string
): EmailAlreadyExistsError => ({
  code: AUTH_ERROR_CODE.EMAIL_ALREADY_EXISTS,
  debugMessage,
});

/**
 * Creates a weak password error.
 */
const createWeakPasswordError = (debugMessage?: string): WeakPasswordError => ({
  code: AUTH_ERROR_CODE.WEAK_PASSWORD,
  debugMessage,
});

/**
 * Creates an invalid email error.
 */
const createInvalidEmailError = (debugMessage?: string): InvalidEmailError => ({
  code: AUTH_ERROR_CODE.INVALID_EMAIL,
  debugMessage,
});

/**
 * Creates an email verification error.
 */
const createEmailVerificationError = (
  debugMessage?: string
): EmailVerificationError => ({
  code: AUTH_ERROR_CODE.EMAIL_VERIFICATION_ERROR,
  debugMessage,
});

/**
 * Creates a password reset error.
 */
const createPasswordResetError = (
  debugMessage?: string
): PasswordResetError => ({
  code: AUTH_ERROR_CODE.PASSWORD_RESET_ERROR,
  debugMessage,
});

/**
 * Creates an invalid token error.
 */
const createInvalidTokenError = (debugMessage?: string): InvalidTokenError => ({
  code: AUTH_ERROR_CODE.INVALID_TOKEN,
  debugMessage,
});

/**
 * Creates a same password error (new password matches the old one).
 */
const createSamePasswordError = (debugMessage?: string): SamePasswordError => ({
  code: AUTH_ERROR_CODE.SAME_PASSWORD,
  debugMessage,
});

/**
 * Maps Supabase Auth errors to domain authentication errors.
 *
 * @param error - Supabase Auth error
 * @returns Domain authentication error
 */
export const mapSupabaseAuthError = (error: unknown): AuthenticationFailure => {
  // Handle Supabase AuthError
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    "status" in error
  ) {
    const authError = error as {
      message: string;
      status?: number;
      code?: string;
    };

    // Map common Supabase Auth error codes
    const errorMessage = authError.message.toLowerCase();

    // Email not confirmed (unverified user trying to sign in)
    if (
      authError.code === "email_not_confirmed" ||
      errorMessage.includes("email not confirmed") ||
      errorMessage.includes("email address not confirmed")
    ) {
      return createEmailVerificationError(authError.message);
    }

    // Invalid credentials
    if (
      authError.status === 400 &&
      (errorMessage.includes("invalid login credentials") ||
        errorMessage.includes("invalid password") ||
        errorMessage.includes("user not found") ||
        authError.code === "invalid_credentials")
    ) {
      return createInvalidCredentialsError(authError.message);
    }

    // Email already exists
    if (
      errorMessage.includes("user already registered") ||
      errorMessage.includes("email already exists") ||
      authError.code === "signup_disabled"
    ) {
      return createEmailAlreadyExistsError(authError.message);
    }

    // Same password as current
    if (
      authError.code === "same_password" ||
      errorMessage.includes("should be different") ||
      errorMessage.includes("same password")
    ) {
      return createSamePasswordError(authError.message);
    }

    // Weak password
    if (
      errorMessage.includes("password") &&
      (errorMessage.includes("weak") ||
        errorMessage.includes("too short") ||
        errorMessage.includes("requirements"))
    ) {
      return createWeakPasswordError(authError.message);
    }

    // Invalid email format
    if (
      errorMessage.includes("invalid email") ||
      errorMessage.includes("email format") ||
      authError.code === "validation_failed"
    ) {
      return createInvalidEmailError(authError.message);
    }

    // Email verification errors
    if (
      errorMessage.includes("email verification") ||
      errorMessage.includes("verification failed") ||
      errorMessage.includes("token") ||
      authError.code === "email_not_confirmed" ||
      authError.code === "token_expired"
    ) {
      if (
        errorMessage.includes("expired") ||
        errorMessage.includes("invalid token") ||
        authError.code === "token_expired"
      ) {
        return createInvalidTokenError(authError.message);
      }
      return createEmailVerificationError(authError.message);
    }

    // Password reset errors
    if (
      errorMessage.includes("password reset") ||
      errorMessage.includes("reset failed") ||
      authError.code === "email_not_found"
    ) {
      if (
        errorMessage.includes("expired") ||
        errorMessage.includes("invalid token")
      ) {
        return createInvalidTokenError(authError.message);
      }
      return createPasswordResetError(authError.message);
    }

    // Invalid token (general)
    if (
      errorMessage.includes("invalid token") ||
      errorMessage.includes("token expired") ||
      authError.code === "invalid_token" ||
      authError.code === "token_expired"
    ) {
      return createInvalidTokenError(authError.message);
    }
  }

  // Handle generic Error objects
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    // Try to map based on message content
    if (
      errorMessage.includes("invalid") &&
      (errorMessage.includes("credentials") ||
        errorMessage.includes("password"))
    ) {
      return createInvalidCredentialsError(error.message);
    }

    if (errorMessage.includes("email") && errorMessage.includes("already")) {
      return createEmailAlreadyExistsError(error.message);
    }

    if (errorMessage.includes("password") && errorMessage.includes("weak")) {
      return createWeakPasswordError(error.message);
    }

    // Generic authentication error - keep original message for debugging only.
    return {
      code: AUTH_ERROR_CODE.AUTHENTICATION_ERROR,
      debugMessage: error.message,
      originalError: error,
    };
  }

  // Fallback for unknown errors
  const debugMessage =
    error && typeof error === "object" && "message" in error
      ? String(
          (error as { message?: unknown }).message ||
            "An unknown authentication error occurred"
        )
      : error && typeof error === "string"
        ? error
        : "An unknown authentication error occurred";

  return {
    code: AUTH_ERROR_CODE.AUTHENTICATION_ERROR,
    debugMessage,
    originalError: error,
  };
};
