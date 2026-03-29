/**
 * Error code constants used across the application.
 * These codes correspond to domain error types.
 */

/**
 * Authentication error code constants.
 * Use these constants instead of hardcoded strings in error factories and mappers.
 */
export const AUTH_ERROR_CODE = Object.freeze({
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  WEAK_PASSWORD: "WEAK_PASSWORD",
  INVALID_EMAIL: "INVALID_EMAIL",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTH_PROVIDER_SERVER_ERROR: "AUTH_PROVIDER_SERVER_ERROR",
  EMAIL_VERIFICATION_ERROR: "EMAIL_VERIFICATION_ERROR",
  PASSWORD_RESET_ERROR: "PASSWORD_RESET_ERROR",
  INVALID_TOKEN: "INVALID_TOKEN",
  SAME_PASSWORD: "SAME_PASSWORD",
  PASSWORD_UPDATE_NOT_ALLOWED: "PASSWORD_UPDATE_NOT_ALLOWED",
} as const);

/**
 * Authentication error codes as array.
 * Used for validation and iteration over error codes.
 */
export const AUTH_ERROR_CODES = Object.freeze(Object.values(AUTH_ERROR_CODE));

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
