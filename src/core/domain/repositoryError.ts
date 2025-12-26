/**
 * Domain error types for repository operations.
 * These errors are returned by repositories and can be handled by usecases.
 */

/**
 * Base repository error type.
 */
export type RepositoryError = {
  message: string;
  code: string;
};

/**
 * Error when a requested entity is not found.
 */
export type NotFoundError = RepositoryError & {
  code: "NOT_FOUND";
  entityType: string;
  entityId: string;
};

/**
 * Error when a database constraint is violated.
 */
export type ConstraintError = RepositoryError & {
  code: "CONSTRAINT_VIOLATION";
  constraint: string;
};

/**
 * Error when a database operation fails (network, connection, etc.).
 */
export type DatabaseError = RepositoryError & {
  code: "DATABASE_ERROR";
  originalError?: unknown;
};

/**
 * Error factory functions.
 */
export const createNotFoundError = (
  entityType: string,
  entityId: string
): NotFoundError => ({
  code: "NOT_FOUND",
  message: `${entityType} with id ${entityId} not found`,
  entityType,
  entityId,
});

export const createConstraintError = (
  constraint: string,
  message?: string
): ConstraintError => ({
  code: "CONSTRAINT_VIOLATION",
  message: message ?? `Database constraint violation: ${constraint}`,
  constraint,
});

export const createDatabaseError = (
  message: string,
  originalError?: unknown
): DatabaseError => ({
  code: "DATABASE_ERROR",
  message,
  originalError,
});
