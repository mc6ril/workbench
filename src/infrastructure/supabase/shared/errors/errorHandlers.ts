import { isRepositoryError } from "@/core/domain/repositoryError.guards";

import { mapSupabaseAuthError } from "@/infrastructure/supabase/auth/AuthMapper.supabase";

import { AUTH_ERROR_CODES } from "@/shared/constants/errorCodes";
import { hasErrorCode } from "@/shared/utils/guards";

import { mapSupabaseError } from "./repositoryErrorMapper";

/**
 * Standardized error handling for repository methods.
 * Re-throws domain repository errors and wraps unknown errors.
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
    throw error;
  }

  // Map and throw unknown errors
  throw mapSupabaseError(error, entityType, entityId);
};

/**
 * Standardized error handling for authentication methods.
 * Re-throws domain auth errors (with matching codes) and wraps unknown errors.
 *
 * @param error - Error caught in try/catch block
 * @throws Domain auth error (if code matches) or mapped auth error
 */
export const handleAuthError = (error: unknown): never => {
  // Re-throw domain auth errors (errors with codes in AUTH_ERROR_CODES)
  if (hasErrorCode(error, [...AUTH_ERROR_CODES])) {
    throw error;
  }

  // Map and throw unknown errors
  throw mapSupabaseAuthError(error);
};
