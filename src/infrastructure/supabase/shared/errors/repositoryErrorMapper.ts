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

    // RLS (Row-Level Security) policy violations
    // These should be mapped to ConstraintError as they represent policy constraints
    if (
      supabaseError.code === "42501" ||
      (supabaseError.message &&
        supabaseError.message.toLowerCase().includes("row-level security"))
    ) {
      // Use consistent constraint name for RLS violations
      // The presentation layer will translate the message based on the constraint code
      const constraint = "RLS_POLICY_VIOLATION";

      // Use original Supabase message for debugging/logging purposes
      // The presentation layer will handle user-friendly translation based on constraint
      const message =
        supabaseError.message || supabaseError.details || undefined;

      return createConstraintError(constraint, message);
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
