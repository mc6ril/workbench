import { isDomainRuleError } from "@/core/domain/domainRuleError.guards";
import type { NotFoundError } from "@/core/domain/repositoryError";
import { isRepositoryError } from "@/core/domain/repositoryError.guards";

/**
 * Gets a user-facing error message from an error object.
 * Maps error codes to i18n translation keys using type guards.
 * Supports RepositoryError, DomainRuleError, and generic errors.
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

  // Handle RepositoryError using type guard
  if (isRepositoryError(error)) {
    // Special handling for NOT_FOUND with entity info
    if (error.code === "NOT_FOUND") {
      const notFoundError = error as NotFoundError;
      if (notFoundError.entityType && notFoundError.entityId) {
        return tErrors("repository.NOT_FOUND_WITH_ENTITY", {
          entityType: notFoundError.entityType,
          entityId: notFoundError.entityId,
        });
      }
    }

    // Map repository error codes to i18n keys
    const repositoryKeyMap: Record<string, string> = {
      NOT_FOUND: "repository.NOT_FOUND",
      CONSTRAINT_VIOLATION: "repository.CONSTRAINT_VIOLATION",
      DATABASE_ERROR: "repository.DATABASE_ERROR",
    };

    const translationKey = repositoryKeyMap[error.code];
    if (translationKey) {
      return tErrors(translationKey);
    }
  }

  // Handle DomainRuleError using type guard
  if (isDomainRuleError(error)) {
    // Map domain rule error codes to i18n keys
    // Domain rule errors use their code directly as the translation key
    // Format: errors.domain.{CODE}
    const domainKey = `domain.${error.code}`;
    return tErrors(domainKey);
  }

  // Handle auth errors (legacy support - these should eventually use DomainRuleError)
  const authKeyMap: Record<string, string> = {
    INVALID_CREDENTIALS: "auth.INVALID_CREDENTIALS",
    EMAIL_ALREADY_EXISTS: "auth.EMAIL_ALREADY_EXISTS",
    WEAK_PASSWORD: "auth.WEAK_PASSWORD",
    INVALID_EMAIL: "auth.INVALID_EMAIL",
    AUTHENTICATION_ERROR: "auth.AUTHENTICATION_ERROR",
    EMAIL_VERIFICATION_ERROR: "auth.EMAIL_VERIFICATION_ERROR",
    PASSWORD_RESET_ERROR: "auth.PASSWORD_RESET_ERROR",
    INVALID_TOKEN: "auth.INVALID_TOKEN",
  };

  const authTranslationKey = authKeyMap[error.code];
  if (authTranslationKey) {
    return tErrors(authTranslationKey);
  }

  // Fallback for unknown error codes
  return tErrors("generic");
};
