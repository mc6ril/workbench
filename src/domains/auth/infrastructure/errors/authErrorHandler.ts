import { AUTH_ERROR_CODES } from "@/shared/constants/errorCodes";
import { createLoggerFactory } from "@/shared/observability";
import { hasErrorCode } from "@/shared/utils/guards";

import { mapSupabaseAuthError } from "@/domains/auth/infrastructure/supabase/AuthMapper.supabase";

const loggerFactory = createLoggerFactory();
const logger = loggerFactory.forScope("infrastructure.auth-errors");

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
  if (hasErrorCode(error, [...AUTH_ERROR_CODES])) {
    logger.warn("Authentication error", {
      error,
      errorCode: (error as { code?: string }).code,
    });
    throw error;
  }

  const mappedError = mapSupabaseAuthError(error);

  logger.warn("Authentication error (mapped from infrastructure error)", {
    error,
    mappedError,
    errorCode: (mappedError as { code?: string }).code,
  });

  throw mappedError;
};
