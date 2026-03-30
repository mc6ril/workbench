import type { Session } from "@supabase/supabase-js";

import { AUTH_ERROR_CODE } from "@/shared/constants/errorCodes";

import { isSuperuserFromAppMetadata } from "@/domains/auth/infrastructure/supabase/providerCapabilities";
import type { CurrentSession } from "@/domains/session/core/domain/session.types";

type AuthInfrastructureError = {
  code: string;
  debugMessage?: string;
  originalError?: unknown;
};

const createAuthInfrastructureError = (
  code: string,
  debugMessage?: string,
  originalError?: unknown
): AuthInfrastructureError => ({
  code,
  debugMessage,
  originalError,
});

/**
 * Maps Supabase Session to the stable session shape returned by auth flows.
 */
export const mapSupabaseSessionToCurrentSession = (
  session: Session,
  userEmail: string
): CurrentSession => {
  return {
    userId: session.user.id,
    loginEmail: userEmail,
    accessToken: session.access_token,
    isSuperuser: isSuperuserFromAppMetadata(session.user.app_metadata),
  };
};

/**
 * Maps Supabase Auth errors to stable application auth error codes.
 */
export const mapSupabaseAuthError = (
  error: unknown
): AuthInfrastructureError => {
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
    const errorMessage = authError.message.toLowerCase();

    if (
      authError.code === "email_not_confirmed" ||
      errorMessage.includes("email not confirmed") ||
      errorMessage.includes("email address not confirmed")
    ) {
      return createAuthInfrastructureError(
        AUTH_ERROR_CODE.EMAIL_VERIFICATION_ERROR,
        authError.message
      );
    }

    if (
      authError.status === 400 &&
      (errorMessage.includes("invalid login credentials") ||
        errorMessage.includes("invalid password") ||
        errorMessage.includes("user not found") ||
        authError.code === "invalid_credentials")
    ) {
      return createAuthInfrastructureError(
        AUTH_ERROR_CODE.INVALID_CREDENTIALS,
        authError.message
      );
    }

    if (
      errorMessage.includes("user already registered") ||
      errorMessage.includes("email already exists") ||
      authError.code === "signup_disabled"
    ) {
      return createAuthInfrastructureError(
        AUTH_ERROR_CODE.EMAIL_ALREADY_EXISTS,
        authError.message
      );
    }

    if (
      authError.code === "same_password" ||
      errorMessage.includes("should be different") ||
      errorMessage.includes("same password")
    ) {
      return createAuthInfrastructureError(
        AUTH_ERROR_CODE.SAME_PASSWORD,
        authError.message
      );
    }

    if (
      errorMessage.includes("password") &&
      (errorMessage.includes("weak") ||
        errorMessage.includes("too short") ||
        errorMessage.includes("requirements"))
    ) {
      return createAuthInfrastructureError(
        AUTH_ERROR_CODE.WEAK_PASSWORD,
        authError.message
      );
    }

    if (
      errorMessage.includes("invalid email") ||
      errorMessage.includes("email format") ||
      authError.code === "validation_failed"
    ) {
      return createAuthInfrastructureError(
        AUTH_ERROR_CODE.INVALID_EMAIL,
        authError.message
      );
    }

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
        return createAuthInfrastructureError(
          AUTH_ERROR_CODE.INVALID_TOKEN,
          authError.message
        );
      }

      return createAuthInfrastructureError(
        AUTH_ERROR_CODE.EMAIL_VERIFICATION_ERROR,
        authError.message
      );
    }

    if (
      errorMessage.includes("password reset") ||
      errorMessage.includes("reset failed") ||
      authError.code === "email_not_found"
    ) {
      if (
        errorMessage.includes("expired") ||
        errorMessage.includes("invalid token")
      ) {
        return createAuthInfrastructureError(
          AUTH_ERROR_CODE.INVALID_TOKEN,
          authError.message
        );
      }

      return createAuthInfrastructureError(
        AUTH_ERROR_CODE.PASSWORD_RESET_ERROR,
        authError.message
      );
    }

    if (
      errorMessage.includes("invalid token") ||
      errorMessage.includes("token expired") ||
      authError.code === "invalid_token" ||
      authError.code === "token_expired"
    ) {
      return createAuthInfrastructureError(
        AUTH_ERROR_CODE.INVALID_TOKEN,
        authError.message
      );
    }

    if (typeof authError.status === "number" && authError.status >= 500) {
      return createAuthInfrastructureError(
        AUTH_ERROR_CODE.AUTH_PROVIDER_SERVER_ERROR,
        authError.message,
        error
      );
    }
  }

  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    if (
      errorMessage.includes("invalid") &&
      (errorMessage.includes("credentials") ||
        errorMessage.includes("password"))
    ) {
      return createAuthInfrastructureError(
        AUTH_ERROR_CODE.INVALID_CREDENTIALS,
        error.message
      );
    }

    if (errorMessage.includes("email") && errorMessage.includes("already")) {
      return createAuthInfrastructureError(
        AUTH_ERROR_CODE.EMAIL_ALREADY_EXISTS,
        error.message
      );
    }

    if (errorMessage.includes("password") && errorMessage.includes("weak")) {
      return createAuthInfrastructureError(
        AUTH_ERROR_CODE.WEAK_PASSWORD,
        error.message
      );
    }

    return createAuthInfrastructureError(
      AUTH_ERROR_CODE.AUTHENTICATION_ERROR,
      error.message,
      error
    );
  }

  const debugMessage =
    error && typeof error === "object" && "message" in error
      ? String(
          (error as { message?: unknown }).message ||
            "An unknown authentication error occurred"
        )
      : error && typeof error === "string"
        ? error
        : "An unknown authentication error occurred";

  return createAuthInfrastructureError(
    AUTH_ERROR_CODE.AUTHENTICATION_ERROR,
    debugMessage,
    error
  );
};
