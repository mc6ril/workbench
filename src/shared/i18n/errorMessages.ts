import type { RepositoryError } from "@/core/domain/repositoryError";

import {
  AUTH_ERROR_CODES,
  type AuthErrorCode,
  REPOSITORY_ERROR_CODES,
  type RepositoryErrorCode,
} from "@/shared/constants/errorCodes";

/**
 * Type-safe mapping of auth error codes to i18n translation keys.
 * Ensures all auth error codes have corresponding translation keys.
 * Frozen at runtime to prevent accidental mutations.
 */
const AUTH_ERROR_TRANSLATION_KEYS: Readonly<Record<AuthErrorCode, string>> =
  Object.freeze({
    INVALID_CREDENTIALS: "auth.INVALID_CREDENTIALS",
    EMAIL_ALREADY_EXISTS: "auth.EMAIL_ALREADY_EXISTS",
    WEAK_PASSWORD: "auth.WEAK_PASSWORD",
    INVALID_EMAIL: "auth.INVALID_EMAIL",
    AUTHENTICATION_ERROR: "auth.AUTHENTICATION_ERROR",
    EMAIL_VERIFICATION_ERROR: "auth.EMAIL_VERIFICATION_ERROR",
    PASSWORD_RESET_ERROR: "auth.PASSWORD_RESET_ERROR",
    INVALID_TOKEN: "auth.INVALID_TOKEN",
  });

/**
 * Type-safe mapping of repository error codes to i18n translation keys.
 * Ensures all repository error codes have corresponding translation keys.
 * Frozen at runtime to prevent accidental mutations.
 */
const REPOSITORY_ERROR_TRANSLATION_KEYS: Readonly<
  Record<RepositoryErrorCode, string>
> = Object.freeze({
  NOT_FOUND: "repository.NOT_FOUND",
  CONSTRAINT_VIOLATION: "repository.CONSTRAINT_VIOLATION",
  DATABASE_ERROR: "repository.DATABASE_ERROR",
});

/**
 * Type guard to check if a string is an AuthErrorCode.
 */
const isAuthErrorCode = (code: string): code is AuthErrorCode => {
  return AUTH_ERROR_CODES.includes(code as AuthErrorCode);
};

/**
 * Type guard to check if a string is a RepositoryErrorCode.
 */
const isRepositoryErrorCode = (code: string): code is RepositoryErrorCode => {
  return REPOSITORY_ERROR_CODES.includes(code as RepositoryErrorCode);
};

/**
 * Gets a user-facing error message from an error code.
 * Maps error codes to i18n translation keys using type-safe constants.
 *
 * @param error - The error object with a code property
 * @param tErrors - Translation function for errors namespace
 * @returns Translated error message
 */
export const getErrorMessage = (
  error: { code?: string } | null | undefined,
  tErrors: (key: string, params?: Record<string, string | number>) => string
): string => {
  if (!error || !error.code) {
    return tErrors("generic");
  }

  const code = error.code;

  // Auth errors - use type-safe mapping
  if (isAuthErrorCode(code)) {
    const translationKey = AUTH_ERROR_TRANSLATION_KEYS[code];
    return tErrors(translationKey);
  }

  // Repository errors - use type-safe mapping
  if (isRepositoryErrorCode(code)) {
    // Special handling for NOT_FOUND with entity info
    if (code === "NOT_FOUND") {
      const notFoundError = error as RepositoryError & {
        entityType?: string;
        entityId?: string;
      };
      if (notFoundError.entityType && notFoundError.entityId) {
        return tErrors("repository.NOT_FOUND_WITH_ENTITY", {
          entityType: notFoundError.entityType,
          entityId: notFoundError.entityId,
        });
      }
    }

    const translationKey = REPOSITORY_ERROR_TRANSLATION_KEYS[code];
    return tErrors(translationKey);
  }

  // Fallback for unknown error codes
  return tErrors("generic");
};
