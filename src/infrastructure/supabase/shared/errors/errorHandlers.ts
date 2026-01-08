import { mapSupabaseAuthError } from "@/infrastructure/supabase/auth/AuthMapper.supabase";

import {
  AUTH_ERROR_CODES,
  REPOSITORY_ERROR_CODES,
} from "@/shared/constants/errorCodes";
import { hasErrorCode } from "@/shared/utils/guards";

import { mapSupabaseError } from "./repositoryErrorMapper";

/**
 * Standardized error handling for repository methods.
 * Re-throws domain repository errors (with matching codes) and wraps unknown errors.
 *
 * @param error - Error caught in try/catch block
 * @param entityType - Type of entity for context (e.g., "Project", "Ticket")
 * @throws Domain repository error (if code matches) or mapped repository error
 */
export const handleRepositoryError = (
  error: unknown,
  entityType: string = "Entity"
): never => {
  // Re-throw domain repository errors (errors with codes in REPOSITORY_ERROR_CODES)
  if (hasErrorCode(error, [...REPOSITORY_ERROR_CODES])) {
    throw error;
  }

  // Map and throw unknown errors
  throw mapSupabaseError(error, entityType);
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
