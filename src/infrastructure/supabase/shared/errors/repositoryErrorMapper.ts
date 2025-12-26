import {
  createConstraintError,
  createDatabaseError,
  type RepositoryError,
} from "@/core/domain/repositoryError";

/**
 * Maps Supabase errors to domain repository errors.
 *
 * @param error - Supabase error or unknown error
 * @param entityType - Type of entity for context (e.g., "Project", "Ticket")
 * @returns Domain repository error
 */
export const mapSupabaseError = (
  error: unknown,
  entityType: string = "Entity"
): RepositoryError => {
  // Handle Supabase PostgrestError
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    "message" in error &&
    "details" in error
  ) {
    const supabaseError = error as {
      code: string;
      message: string;
      details?: string;
      hint?: string;
    };

    // Map specific Supabase error codes to domain errors
    if (supabaseError.code === "PGRST116") {
      // Not found (no rows returned)
      return createDatabaseError(`${entityType} not found`, supabaseError);
    }

    if (
      supabaseError.code === "23505" ||
      supabaseError.code === "23503" ||
      supabaseError.code === "23514"
    ) {
      // Constraint violation (unique, foreign key, check)
      return createConstraintError(
        supabaseError.code,
        supabaseError.message || supabaseError.details
      );
    }

    // Generic database error
    return createDatabaseError(
      supabaseError.message || `Database error: ${supabaseError.code}`,
      supabaseError
    );
  }

  // Handle generic errors
  if (error instanceof Error) {
    return createDatabaseError(error.message, error);
  }

  // Fallback for unknown errors
  return createDatabaseError(
    `Unknown error occurred while accessing ${entityType}`,
    error
  );
};
