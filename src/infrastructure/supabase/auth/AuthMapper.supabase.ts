import type { Session } from "@supabase/supabase-js";

import type {
  AuthenticationFailure,
  AuthSession,
  EmailAlreadyExistsError,
  EmailVerificationError,
  InvalidCredentialsError,
  InvalidEmailError,
  InvalidTokenError,
  PasswordResetError,
  WeakPasswordError,
} from "@/core/domain/auth.schema";

/**
 * Maps Supabase Session to domain AuthSession.
 *
 * @param session - Supabase session
 * @param userEmail - User email from Supabase user object
 * @returns Domain auth session
 */
export const mapSupabaseSessionToDomain = (
  session: Session,
  userEmail: string
): AuthSession => {
  return {
    userId: session.user.id,
    email: userEmail,
    accessToken: session.access_token,
  };
};

/**
 * Creates an invalid credentials error.
 */
const createInvalidCredentialsError = (
  message: string = "Invalid email or password"
): InvalidCredentialsError => ({
  code: "INVALID_CREDENTIALS",
  message,
});

/**
 * Creates an email already exists error.
 */
const createEmailAlreadyExistsError = (
  message: string = "Email is already registered"
): EmailAlreadyExistsError => ({
  code: "EMAIL_ALREADY_EXISTS",
  message,
});

/**
 * Creates a weak password error.
 */
const createWeakPasswordError = (
  message: string = "Password does not meet requirements"
): WeakPasswordError => ({
  code: "WEAK_PASSWORD",
  message,
});

/**
 * Creates an invalid email error.
 */
const createInvalidEmailError = (
  message: string = "Invalid email format"
): InvalidEmailError => ({
  code: "INVALID_EMAIL",
  message,
});

/**
 * Creates an email verification error.
 */
const createEmailVerificationError = (
  message: string = "Email verification failed"
): EmailVerificationError => ({
  code: "EMAIL_VERIFICATION_ERROR",
  message,
});

/**
 * Creates a password reset error.
 */
const createPasswordResetError = (
  message: string = "Password reset failed"
): PasswordResetError => ({
  code: "PASSWORD_RESET_ERROR",
  message,
});

/**
 * Creates an invalid token error.
 */
const createInvalidTokenError = (
  message: string = "Invalid or expired token"
): InvalidTokenError => ({
  code: "INVALID_TOKEN",
  message,
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

    // Generic authentication error
    return {
      code: "AUTHENTICATION_ERROR",
      message: error.message,
      originalError: error,
    };
  }

  // Fallback for unknown errors
  return {
    code: "AUTHENTICATION_ERROR",
    message: "An unknown authentication error occurred",
    originalError: error,
  };
};
