/**
 * Error code constants used across the application.
 * These codes correspond to domain error types.
 */

/**
 * Authentication error codes.
 * Used for authentication-related domain errors.
 */
export const AUTH_ERROR_CODES = Object.freeze([
  "INVALID_CREDENTIALS",
  "EMAIL_ALREADY_EXISTS",
  "WEAK_PASSWORD",
  "INVALID_EMAIL",
  "AUTHENTICATION_ERROR",
  "EMAIL_VERIFICATION_ERROR",
  "PASSWORD_RESET_ERROR",
  "INVALID_TOKEN",
]);

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

/**
 * Repository error codes.
 * Used for repository-related domain errors.
 */
export const REPOSITORY_ERROR_CODES = Object.freeze([
  "NOT_FOUND",
  "CONSTRAINT_VIOLATION",
  "DATABASE_ERROR",
]);

export type RepositoryErrorCode = (typeof REPOSITORY_ERROR_CODES)[number];
