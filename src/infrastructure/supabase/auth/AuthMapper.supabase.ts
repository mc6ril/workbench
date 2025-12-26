import type { Session } from "@supabase/supabase-js";

import type {
  AuthenticationFailure,
  AuthSession,
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  InvalidEmailError,
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
 * Maps Supabase Auth errors to domain authentication errors.
 *
 * @param error - Supabase Auth error
 * @returns Domain authentication error
 */
export const mapSupabaseAuthError = (
  error: unknown
): AuthenticationFailure => {
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

