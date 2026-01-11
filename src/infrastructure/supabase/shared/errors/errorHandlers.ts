import type { RepositoryErrorUnion } from "@/core/domain/repositoryError";
import { isRepositoryError } from "@/core/domain/repositoryError.guards";

import { mapSupabaseAuthError } from "@/infrastructure/supabase/auth/AuthMapper.supabase";

import { AUTH_ERROR_CODES } from "@/shared/constants/errorCodes";
import { hasErrorCode } from "@/shared/utils/guards";

import { mapSupabaseError } from "./repositoryErrorMapper";

import { loggerFactory } from "@/configs/logger";

// Create scoped logger for repository error handling
const logger = loggerFactory.forScope("infrastructure.repository-errors");

/**
 * Standardized error handling for repository methods.
 * Re-throws domain repository errors and wraps unknown errors.
 *
 * This function:
 * 1. Logs all repository errors with context (entity type, ID, error details)
 * 2. Re-throws domain repository errors (already mapped)
 * 3. Maps and throws unknown errors (Supabase, network, etc.)
 *
 * Error logging preserves original error context for debugging while
 * ensuring domain layer receives consistent error types.
 *
 * @param error - Error caught in try/catch block
 * @param entityType - Type of entity for context (e.g., "Project", "Ticket")
 * @param entityId - Optional entity ID for NotFoundError mapping
 * @throws Domain repository error (if already a RepositoryError) or mapped repository error
 */
export const handleRepositoryError = (
  error: unknown,
  entityType: string = "Entity",
  entityId?: string
): never => {
  // Re-throw domain repository errors (use type guard instead of code list)
  if (isRepositoryError(error)) {
    const repositoryError = error as RepositoryErrorUnion;
    // Log domain repository error with context
    logger.error("Repository error", {
      error,
      entityType,
      entityId,
      errorCode: repositoryError.code,
      debugMessage: repositoryError.debugMessage,
    });
    throw error;
  }

  // Map unknown errors to domain errors
  const mappedError = mapSupabaseError(error, entityType, entityId);

  // Log mapped error with original error context
  logger.error("Repository error (mapped from infrastructure error)", {
    error,
    mappedError,
    entityType,
    entityId,
    errorCode: mappedError.code,
    debugMessage: mappedError.debugMessage,
  });

  throw mappedError;
};

/**
 * Standardized error handling for authentication methods.
 * Re-throws domain auth errors (with matching codes) and wraps unknown errors.
 *
 * Authentication errors are handled separately from repository errors
 * because they use a different error mapping system (AuthMapper.supabase).
 *
 * @param error - Error caught in try/catch block
 * @throws Domain auth error (if code matches) or mapped auth error
 */
export const handleAuthError = (error: unknown): never => {
  // Re-throw domain auth errors (errors with codes in AUTH_ERROR_CODES)
  if (hasErrorCode(error, [...AUTH_ERROR_CODES])) {
    // Log domain auth error
    const authLogger = loggerFactory.forScope("infrastructure.auth-errors");
    authLogger.error("Authentication error", {
      error,
      errorCode: (error as { code?: string }).code,
    });
    throw error;
  }

  // Map and throw unknown errors
  const mappedError = mapSupabaseAuthError(error);

  // Log mapped auth error
  const authLogger = loggerFactory.forScope("infrastructure.auth-errors");
  authLogger.error("Authentication error (mapped from infrastructure error)", {
    error,
    mappedError,
    errorCode: (mappedError as { code?: string }).code,
  });

  throw mappedError;
};
