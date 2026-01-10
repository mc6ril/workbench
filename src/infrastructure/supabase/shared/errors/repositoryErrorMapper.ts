import {
  createConstraintError,
  createDatabaseError,
  createNotFoundError,
  type RepositoryErrorUnion,
} from "@/core/domain/repositoryError";

/**
 * Maps Supabase errors to domain repository errors.
 *
 * @param error - Supabase error or unknown error
 * @param entityType - Type of entity for context (e.g., "Project", "Ticket")
 * @param entityId - Optional entity ID for NotFoundError
 * @returns Domain repository error union
 */
export const mapSupabaseError = (
  error: unknown,
  entityType: string = "Entity",
  entityId?: string
): RepositoryErrorUnion => {
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
      // Use Supabase-provided message for debugging instead of a user-facing message.
      const debugMessage =
        supabaseError.message ||
        supabaseError.details ||
        `Supabase error: ${supabaseError.code}`;
      return createNotFoundError(
        entityType,
        entityId || "unknown",
        debugMessage
      );
    }

    if (
      supabaseError.code === "23505" ||
      supabaseError.code === "23503" ||
      supabaseError.code === "23514"
    ) {
      // Constraint violation (unique, foreign key, check)
      return createConstraintError(
        supabaseError.code,
        supabaseError.message || supabaseError.details || undefined
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
      const debugMessage =
        supabaseError.message || supabaseError.details || undefined;

      return createConstraintError(constraint, debugMessage);
    }

    // Generic database error - keep original Supabase message for debugging.
    const debugMessage =
      supabaseError.message ||
      supabaseError.details ||
      `Supabase error: ${supabaseError.code}`;

    return createDatabaseError(debugMessage, supabaseError);
  }

  // Handle generic errors
  if (error instanceof Error) {
    return createDatabaseError(error.message, error);
  }

  // Fallback for unknown errors
  return createDatabaseError("Unknown repository error", error);
};
