import type {
  ConstraintError,
  DatabaseError,
  NotFoundError,
  RepositoryError,
} from "./repositoryError";

/**
 * Type guard to check if an error is a RepositoryError.
 * Validates that the error has a code property and matches repository error structure.
 */
export const isRepositoryError = (
  error: unknown
): error is RepositoryError => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const err = error as Record<string, unknown>;

  // Must have a code property
  if (!("code" in err) || typeof err.code !== "string") {
    return false;
  }

  // Check if code matches known repository error codes
  const code = err.code;
  return (
    code === "NOT_FOUND" ||
    code === "CONSTRAINT_VIOLATION" ||
    code === "DATABASE_ERROR"
  );
};

/**
 * Type guard to check if an error is a NotFoundError.
 */
export const isNotFoundError = (error: unknown): error is NotFoundError => {
  return (
    isRepositoryError(error) &&
    error.code === "NOT_FOUND" &&
    "entityType" in error &&
    "entityId" in error &&
    typeof (error as NotFoundError).entityType === "string" &&
    typeof (error as NotFoundError).entityId === "string"
  );
};

/**
 * Type guard to check if an error is a ConstraintError.
 */
export const isConstraintError = (
  error: unknown
): error is ConstraintError => {
  return (
    isRepositoryError(error) &&
    error.code === "CONSTRAINT_VIOLATION" &&
    "constraint" in error &&
    typeof (error as ConstraintError).constraint === "string"
  );
};

/**
 * Type guard to check if an error is a DatabaseError.
 */
export const isDatabaseError = (error: unknown): error is DatabaseError => {
  return (
    isRepositoryError(error) &&
    error.code === "DATABASE_ERROR"
  );
};
